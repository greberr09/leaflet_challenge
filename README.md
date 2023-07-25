# leaflet_challenge

Leaflet application to display earthquake data from the US Geological Survey

# Part 1

Display earthquake data for the last seven days, all earthquake types, from the U.S. 
Geological Survey.  See //https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php for
more information about the different feed types available.  Data are also avaiable (not used in this application) for the past hour, the past day, and the past 30 days.  All are updated every 5 minutes, and all contain the same json data.  The seven-day data is avaialable for viewing and download at
"https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson".

A map control allows the user to select between a street map layer or a topographic map as the base map, both from OpenSteets.org, and to turn on and off the earthquake features.  Each earthquake feature has a popup that displays the location, date, and time of the quake, as well as its depth and magnitude.

# Part 2

This application is based on part 1, but adds three additional basemap choices, from other sources such as NASA and ArcGIS.  It also adds as a separate layer tectonic plate information.  The tectonic plate layer can be turned on or off in the layer control, separately from the earthquakes chich also can be displayed or not displayed.  The tectonic plate data is available for viewing and download from a GitHub repositoiry, "https://github.com/fraxen/tectonicplates".  There are several different formats available, includeing "boundaries", "plates", and "steps".  Unlike the earthquake data, these do not contain the same fields.  This project uses the "steps" json file, at "https://github.com/fraxen/tectonicplates/blob/master/GeoJSON/PB2002_plates.json?short_path=879951b".   The "steps" data is the largest file and provides more detail at higher zoom levels than the "plates" or "boundaries" versions, but only contains geospatial information.  The other versions provide more information about the name of the plate and the source of the data that could be used for popups, but allowing for more up-close examination of the earthquake data seemed more important, and the plate names are largely associated with the continents.

# User notes

The three basemaps which are not from OpenStreets each have zoom level limitations as defined by the data provider.  For some of the maps, the server will not allow a zoom in beyond the zoom limitation size, so clicking on the zoom button has no effect, and for others the zoom will work but the basemap will not be displayed.  The data providers set these parameters as requirements in the API calls to get the tiles for the map.   

The data for the earthquakes and tectonic plates covers all continents, but does not retile if the user tries to scroll around the world a second time, so east and west navigation beyond the data for one set of continents will only show the base map.  For example, moving west from Alaska toward Asia, no earthquake or tectonic plate data will be visible in countries such as Japan, but moving east from Alaska toward Europe and Asia, the plates and earthquakes along the Asian side of the Pacific Rim will display.  

The earthquakes with deeper magnitude tend to fall along tectonic plate lines.   For the Part 1 map, the map is centered on the middle of the United States, and the deeper magnitudes are largely not visible in that view, so the quakes all seem to fall into two legend categories.  Moving east to Alaska or south to Central America shows quakes of deeper magnitudes, as does moving east to Asia.

Because GitHub does not allow direct service of individual data pages by a request from another server, even with CORS enabled, the tectonic plate data was downloaded as a .json file and has to be served either by running Live Server or another server such as an Express Server on the local host.  Alternatively, a proxy server could be run as the back end.   This project was developed using Live Server, which requires no additional work for any user who has Live Server installed.

# Technical notes

The code uses leaflet and d3, but the script packages are called within the index.html, so nothing has to be installed locally.   The style.css is used to set display properties for the legend.  The legend code and the use of css for this are based on a combination of class activities, leaflet documentation, and a lot of online research on StackOverflow.  The layer control relies only on javascript, not css, but is derived from the same sources.   The code for CORS handling was also derived after additional online research, as this was not an activity we pursued in class.
