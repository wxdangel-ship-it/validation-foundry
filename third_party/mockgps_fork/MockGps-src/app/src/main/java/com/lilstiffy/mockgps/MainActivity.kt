package com.lilstiffy.mockgps

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.Bundle
import android.os.IBinder
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.core.view.WindowCompat
import com.google.android.gms.maps.model.LatLng
import com.lilstiffy.mockgps.service.LocationHelper
import com.lilstiffy.mockgps.service.MockLocationService
import com.lilstiffy.mockgps.service.VibratorService
import com.lilstiffy.mockgps.storage.StorageManager
import com.lilstiffy.mockgps.ui.screens.MapScreen
import com.lilstiffy.mockgps.ui.theme.MockGpsTheme

class MainActivity : ComponentActivity() {
    companion object {
        const val EXTRA_LAT = "lat"
        const val EXTRA_LNG = "lng"
        const val EXTRA_AUTOSTART = "autostart"
        const val EXTRA_STOP = "stop"
    }

    private var mockLocationService: MockLocationService? = null
        private set(value) {
            field = value
            MockLocationService.instance = value
        }

    private var isBound = false
    private var requestedLatLng: LatLng? = null
    private var requestedAutostart = false
    private var requestedStop = false
    private var launchIntentApplied = false

    private val connection = object : ServiceConnection {
        override fun onServiceConnected(className: ComponentName, service: IBinder) {
            val binder = service as MockLocationService.MockLocationBinder
            mockLocationService = binder.getService()
            isBound = true
            applyLaunchIntentIfReady()
        }

        override fun onServiceDisconnected(className: ComponentName) {
            isBound = false
        }
    }

    fun toggleMocking(): Boolean {
        if (isBound && LocationHelper.hasPermission(this)) {
            mockLocationService?.toggleMocking()
            if (mockLocationService?.isMocking == true) {
                Toast.makeText(this, "Mocking location...", Toast.LENGTH_SHORT).show()
                VibratorService.vibrate()
                return true
            } else if (mockLocationService?.isMocking == false) {
                Toast.makeText(this, "Stopped mocking location...", Toast.LENGTH_SHORT).show()
                VibratorService.vibrate()
                return false
            }
        } else if (!isBound && LocationHelper.hasPermission(this))
            Toast.makeText(this, "Service not bound", Toast.LENGTH_SHORT).show()
        else
            Toast.makeText(this, "No Location permission", Toast.LENGTH_SHORT).show()

        return false
    }

    private fun parseLaunchIntent(intent: Intent?) {
        requestedLatLng = intent
            ?.getStringExtra(EXTRA_LAT)
            ?.toDoubleOrNull()
            ?.let { lat ->
                intent.getStringExtra(EXTRA_LNG)?.toDoubleOrNull()?.let { lng ->
                    LatLng(lat, lng)
                }
            }

        requestedAutostart = intent?.getBooleanExtra(EXTRA_AUTOSTART, false) == true
        requestedStop = intent?.getBooleanExtra(EXTRA_STOP, false) == true

        requestedLatLng?.let {
            StorageManager.addLocationToHistory(it)
        }
    }

    private fun applyLaunchIntentIfReady() {
        if (!isBound || launchIntentApplied)
            return

        requestedLatLng?.let {
            mockLocationService?.setLatLng(it)
        }

        if (requestedStop) {
            mockLocationService?.stopMocking()
        } else if (requestedAutostart) {
            mockLocationService?.ensureMocking()
        }

        launchIntentApplied = true
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        parseLaunchIntent(intent)

        setContent {
            MockGpsTheme {
                // A surface container using the 'background' color from the theme
                Surface(
                    modifier = Modifier
                        .fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    MapScreen(activity = this)
                }
            }
        }

        // Start the service
        val serviceIntent = Intent(this, MockLocationService::class.java)
        startService(serviceIntent)

        // Bind to the service
        bindService(serviceIntent, connection, Context.BIND_AUTO_CREATE)
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        setIntent(intent)
        launchIntentApplied = false
        parseLaunchIntent(intent)
        applyLaunchIntentIfReady()
    }

    override fun onDestroy() {
        super.onDestroy()

        // Unbind from the service
        if (isBound) {
            unbindService(connection)
            isBound = false
        }
    }
}

@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
    MockGpsTheme {
    }
}
