package com.lilstiffy.mockgps.storage

import android.content.Context
import android.content.SharedPreferences
import androidx.core.content.edit
import com.google.android.gms.maps.model.LatLng
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.lilstiffy.mockgps.extensions.equalTo
import com.lilstiffy.mockgps.service.LocationHelper
import com.lilstiffy.mockgps.ui.models.LocationEntry

object StorageManager {
    private const val PREF = "gpsprefs"
    private const val KEY_HISTORY = "history"
    private const val KEY_FAVORITES = "favorites"
    private const val KEY_LAST_LAT = "last_lat"
    private const val KEY_LAST_LNG = "last_lng"
    private const val KEY_RESUME_MOCKING = "resume_mocking"

    private lateinit var pref: SharedPreferences

    fun initialise(context: Context) {
        pref = context.getSharedPreferences(PREF, Context.MODE_PRIVATE)
    }

    fun getLatestLocation(): LatLng {
        val lat = pref.getString(KEY_LAST_LAT, null)?.toDoubleOrNull()
        val lng = pref.getString(KEY_LAST_LNG, null)?.toDoubleOrNull()
        if (lat != null && lng != null)
            return LatLng(lat, lng)

        return locationHistory.lastOrNull() ?: LocationHelper.DEFAULT_LOCATION
    }

    fun addLocationToHistory(latLng: LatLng) {
        setLatestLocation(latLng)
        val tempHistory = locationHistory
        if (!locationHistory.contains(latLng)) {
            tempHistory.add(latLng)
            locationHistory = tempHistory
        }
    }

    fun setLatestLocation(latLng: LatLng) {
        pref.edit {
            putString(KEY_LAST_LAT, latLng.latitude.toString())
            putString(KEY_LAST_LNG, latLng.longitude.toString())
            commit()
        }
    }

    fun shouldResumeMocking(): Boolean {
        return pref.getBoolean(KEY_RESUME_MOCKING, false)
    }

    fun setResumeMocking(resume: Boolean) {
        pref.edit {
            putBoolean(KEY_RESUME_MOCKING, resume)
            commit()
        }
    }

    fun toggleFavoriteForPosition(locationEntry: LocationEntry) {
        if (containsFavoriteEntry(locationEntry))
            removeFavorite(locationEntry)
        else
            addLocationToFavorites(locationEntry)
    }

    private fun addLocationToFavorites(locationEntry: LocationEntry) {
        val tempFavorites = favorites
        tempFavorites.add(locationEntry)
        favorites = tempFavorites
    }

    private fun removeFavorite(locationEntry: LocationEntry) {
        val tempFavorites = favorites
        tempFavorites.removeIf { it.latLng.equalTo(locationEntry.latLng) }
        favorites = tempFavorites
    }

    fun containsFavoriteEntry(locationEntry: LocationEntry): Boolean {
        return favorites.any { it.latLng.equalTo(locationEntry.latLng) }
    }

    private var locationHistory: MutableList<LatLng>
        get() {
            val json = pref.getString(KEY_HISTORY, "[]")
            val typeToken = object : TypeToken<MutableList<LatLng>>() {}.type
            return Gson().fromJson(json, typeToken)
        }
        private set(value) {
            val json = Gson().toJson(value)
            pref.edit {
                putString(KEY_HISTORY, json)
                commit()
            }
        }

    var favorites: MutableList<LocationEntry>
        get() {
            val json = pref.getString(KEY_FAVORITES, "[]")
            val typeToken = object : TypeToken<MutableList<LocationEntry>>() {}.type
            return Gson().fromJson(json, typeToken)
        }
        private set(value) {
            val json = Gson().toJson(value)
            pref.edit {
                putString(KEY_FAVORITES, json)
                commit()
            }
        }

}
