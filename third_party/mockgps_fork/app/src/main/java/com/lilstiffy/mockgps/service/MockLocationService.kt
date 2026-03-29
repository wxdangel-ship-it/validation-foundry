package com.lilstiffy.mockgps.service

import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.location.Location
import android.location.LocationManager
import android.location.provider.ProviderProperties
import android.os.Binder
import android.os.Build
import android.os.IBinder
import android.os.SystemClock
import android.util.Log
import android.widget.Toast
import com.google.android.gms.maps.model.LatLng
import com.lilstiffy.mockgps.MainActivity
import com.lilstiffy.mockgps.MockGpsApp
import com.lilstiffy.mockgps.R
import com.lilstiffy.mockgps.storage.StorageManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

class MockLocationService : Service() {

    companion object {
        const val TAG = "MockLocationService"
        private const val CHANNEL_ID = "mockgps_location"
        private const val NOTIFICATION_ID = 1001

        var instance: MockLocationService? = null
    }

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private var mockJob: Job? = null

    var isMocking = false
        private set

    var latLng: LatLng = StorageManager.getLatestLocation()
        private set

    private val locationManager by lazy {
        getSystemService(Context.LOCATION_SERVICE) as LocationManager
    }

    override fun onCreate() {
        super.onCreate()
        instance = this
        createNotificationChannel()
        Log.d(TAG, "Service created")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (StorageManager.shouldResumeMocking() && !isMocking) {
            latLng = StorageManager.getLatestLocation()
            startMockingLocation(persistResumeState = false)
        }
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder {
        return MockLocationBinder()
    }

    override fun onDestroy() {
        mockJob?.cancel()
        mockJob = null
        isMocking = false
        instance = null
        serviceScope.cancel()
        super.onDestroy()
        Log.d(TAG, "Service destroyed")
    }

    fun toggleMocking() {
        if (isMocking) stopMockingLocation() else startMockingLocation()
    }

    fun ensureMocking() {
        if (!isMocking)
            startMockingLocation()
    }

    fun stopMocking() {
        stopMockingLocation()
    }

    fun setLatLng(latLng: LatLng) {
        this.latLng = latLng
        StorageManager.setLatestLocation(latLng)
        if (isMocking)
            startForeground(NOTIFICATION_ID, buildNotification())
    }

    @SuppressLint("MissingPermission")
    private fun startMockingLocation(persistResumeState: Boolean = true) {
        StorageManager.addLocationToHistory(latLng)
        if (persistResumeState)
            StorageManager.setResumeMocking(true)

        if (mockJob?.isActive == true) {
            isMocking = true
            startForeground(NOTIFICATION_ID, buildNotification())
            return
        }

        startForeground(NOTIFICATION_ID, buildNotification())
        isMocking = true
        mockJob = serviceScope.launch {
            mockLocationLoop()
        }
        Log.d(TAG, "Mock location started")
    }

    private fun stopMockingLocation(clearResumeState: Boolean = true) {
        if (clearResumeState)
            StorageManager.setResumeMocking(false)

        mockJob?.cancel()
        mockJob = null
        if (isMocking)
            Log.d(TAG, "Mock location stopped")
        isMocking = false
        stopForeground(true)
    }

    private fun addTestProvider(): Boolean {
        val providerName = LocationManager.GPS_PROVIDER
        val requiresNetwork = true
        val requiresSatellite = false
        val requiresCell = false
        val hasMonetaryCost = false
        val supportsAltitude = false
        val supportsSpeed = false
        val supportsBearing = false
        val powerRequirement = ProviderProperties.POWER_USAGE_HIGH
        val accuracy = ProviderProperties.ACCURACY_FINE

        return try {
            locationManager.addTestProvider(
                providerName,
                requiresNetwork,
                requiresSatellite,
                requiresCell,
                hasMonetaryCost,
                supportsAltitude,
                supportsSpeed,
                supportsBearing,
                powerRequirement,
                accuracy
            )
            true
        } catch (iae: IllegalArgumentException) {
            Log.w(TAG, "Mock provider already exists, reusing it", iae)
            true
        } catch (se: SecurityException) {
            val ctx = MockGpsApp.shared.applicationContext
            serviceScope.launch(Dispatchers.Main) {
                Toast.makeText(
                    ctx,
                    "Mock location failed, you must set this app as your selected mock locations app.",
                    Toast.LENGTH_SHORT
                ).show()
            }
            false
        }
    }

    private suspend fun mockLocationLoop() {
        val providerAdded = addTestProvider()
        if (!providerAdded) {
            isMocking = false
            StorageManager.setResumeMocking(false)
            stopForeground(true)
            return
        }

        locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true)

        while (currentCoroutineContext().isActive && isMocking) {
            val mockLocation = Location(LocationManager.GPS_PROVIDER).apply {
                latitude = latLng.latitude
                longitude = latLng.longitude
                altitude = 12.5
                time = System.currentTimeMillis()
                accuracy = 2f
                elapsedRealtimeNanos = SystemClock.elapsedRealtimeNanos()
            }

            locationManager.setTestProviderLocation(
                LocationManager.GPS_PROVIDER,
                mockLocation
            )
            delay(200L)
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O)
            return

        val manager = getSystemService(NotificationManager::class.java)
        if (manager.getNotificationChannel(CHANNEL_ID) != null)
            return

        val channel = NotificationChannel(
            CHANNEL_ID,
            "Mock GPS",
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = "Keeps mock GPS active while location injection is running."
            setShowBadge(false)
        }
        manager.createNotificationChannel(channel)
    }

    private fun buildNotification(): Notification {
        val activityIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            activityIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val content = "Mocking %.6f, %.6f".format(latLng.latitude, latLng.longitude)

        return Notification.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(getString(R.string.app_name))
            .setContentText(content)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setShowWhen(false)
            .setContentIntent(pendingIntent)
            .build()
    }

    inner class MockLocationBinder : Binder() {
        fun getService(): MockLocationService {
            return this@MockLocationService
        }
    }
}
