import Other from "../mapbox-tools/tools/other.js";	// TODO : yiich that name sucks
import Factory from "../mapbox-tools/tools/factory.js";
import Core from "../basic-tools/tools/core.js";
import Net from "../basic-tools/tools/net.js";
import Util from "../basic-tools/tools/util.js";
import Dom from "../basic-tools/tools/dom.js";
import Store from "./store.js";

export default class PopApp { 
	
	constructor(config) {		
		this.config = config;
		this.current = this.config.maps[Store.Map];

		if (!this.current) this.current = Util.FirstProperty(this.config.maps);
		
		this.AddMap();	
		this.AddSearch();	
		this.AddBaseControls();		
		this.AddGroup();
		this.AddMenu();
	}

	AddMap() {
		var token = "pk.eyJ1IjoiZGVpbC1sZWlkIiwiYSI6ImNrMzZxODNvNTAxZjgzYm56emk1c3doajEifQ.H5CJ3maS0ZuxX_7QTgz1kg";
		var token2 = "sk.eyJ1IjoiZGVpbC1sZWlkIiwiYSI6ImNrNmNheGc4MTFhY3IzbW56dGRud3d5cTkifQ.thkLSPhvTVBjMy8QOZoTiA";
		
		this.map = Factory.Map("map", token, this.current.Style, [Store.Lng, Store.Lat], Store.Zoom);
		
		// Hooking up all events
		this.map.On("StyleChanged", this.OnMapStyleChanged_Handler.bind(this));
		this.map.On("MoveEnd", this.OnMapMoveEnd_Handler.bind(this));
		this.map.On("ZoomEnd", this.OnMapZoomEnd_Handler.bind(this));
		this.map.On("Click", this.OnMapClick_Handler.bind(this));
	}

	AddBaseControls() {
		var fullscreen = Factory.FullscreenControl(Core.Nls("FullScreen_Title"));
		var navigation = Factory.NavigationControl(false, true, Core.Nls("Navigation_ZoomIn_Title"), Core.Nls("Navigation_ZoomOut_Title"));
		var scale = Factory.ScaleControl("metric");
		
		this.map.AddControl(fullscreen, "top-left");
		this.map.AddControl(navigation, "top-left");
		this.map.AddControl(scale);
	}

	AddSearch() {
		this.config.search.items = this.config.search.items.map(i => {
			return { 
				id : i[0], 
				name : i[1],
				label : `${i[1]} (${i[0]})`, 
				extent : [[i[2], i[3]], [i[4], i[5]]] 
			}
		});
		
		var search = Factory.SearchControl(this.config.search.items, Core.Nls("Search_Placeholder"), Core.Nls("Search_Title"));
		
		// Add top-left search bar
		this.map.AddControl(search, "top-left");
		
		search.On("Change", this.OnSearchChange_Handler.bind(this));
		
		search.Node("typeahead").Node("input").focus();
	}

	AddGroup() {
		// Top-right group for toc, legend, etc.	
		this.group = {
			legend : Factory.LegendControl(this.current.Legend, this.current.Title, this.current.Subtitle, this.current.hasCheckbox),
			toc : Factory.TocControl(this.current.TOC),
			opacity : Factory.OpacityControl(Store.Opacity),
			// download : Factory.DownloadControl(Net.FilePath("/assets/proximity-measures.csv"))
			download : Factory.DownloadControl(null)
		}
		
		if (this.current.HasLayer(Store.Layer)) this.group.toc.SelectItem(Store.Layer);
		
		Dom.ToggleCss(this.group.toc.Node("root"), "hidden", !this.current.TOC);
		
		this.map.AddControl(Factory.Group(this.group));
		
		this.group.opacity.title = Core.Nls("Toc_Opacity_Title");
		
		this.group.opacity.On("OpacityChanged", this.OnLegend_OpacityChanged.bind(this));
		this.group.toc.On("LayerVisibility", this.OnTOC_LayerVisibility.bind(this));
	}
	
	AddMenu() {
		// Top-left menu below navigation
		var list = Factory.MapsListControl(this.config.maps);
		var bookmarks = Factory.BookmarksControl(this.config.bookmarks);
		
		this.menu = Factory.MenuControl();
		
		this.map.AddControl(this.menu, "top-left");
		
		this.menu.AddButton("home", "assets/globe.png", Core.Nls("Home_Title"), this.OnHomeClick_Handler.bind(this));
		this.menu.AddPopupButton("maps", "assets/layers.png", Core.Nls("Maps_Title"), list, this.map.Container);
		this.menu.AddPopupButton("bookmarks", "assets/bookmarks.png", Core.Nls("Bookmarks_Title"), bookmarks, this.map.Container);
		
		list.On("MapSelected", this.OnListSelected_Handler.bind(this));
		bookmarks.On("BookmarkSelected", this.OnBookmarkSelected_Handler.bind(this));
	}
	
	OnLegend_OpacityChanged(ev) {		
		Store.Opacity = ev.opacity;
		
		this.map.Choropleth(this.current.LayerIDs, 'fill-color', this.current.Legend, this.group.opacity.opacity);
	}
	
	OnHomeClick_Handler(ev) {
		this.map.FitBounds([[-173.457, 41.846], [-17.324, 75.848]]);
	}
	
	OnBookmarkSelected_Handler(ev) {
		this.menu.Button("bookmarks").popup.Hide();
		
		this.map.FitBounds(ev.item.extent, { animate:false });
	}
		
	OnListSelected_Handler(ev) {
		this.menu.Button("maps").popup.Hide();
		
		Store.Map = ev.id;

		// TODO : Check if SetStyle counts as a map load, if it does, we need to reset layer visibility and paint
		// properties instead of setting the style. If it doesn't we're good as is.
		this.map.SetStyle(ev.map.Style);
		
		this.current = ev.map;
		
		this.group.legend.Reload(this.current.Legend, this.current.Title, this.current.Subtitle);
		this.group.toc.Reload(this.current.TOC, Store.Layer);
		
		if (this.current.HasLayer(Store.Layer)) this.group.toc.SelectItem(Store.Layer);
		
		Dom.ToggleCss(this.group.toc.Node("root"), "hidden", !this.current.TOC);
	}
	
	OnTOC_LayerVisibility(ev) {
		this.map.HideLayer(Store.Layer);
				
		Store.Layer = ev.layer;
		
		this.map.ShowLayer(Store.Layer);
	}
	
	OnMapStyleChanged_Handler(ev) {
		// TODO : Issue here, this.config.TOC doesn't meant the layer is available
		if (this.current.HasLayer(Store.Layer)) this.map.ShowLayer(Store.Layer);
		
		this.map.SetClickableLayers(this.current.LayerIDs);
		this.map.Choropleth(this.current.LayerIDs, 'fill-color', this.current.Legend, this.group.opacity.opacity)
	}
	
	OnMapMoveEnd_Handler(ev) {		
		Store.Lat = this.map.Center.lat;
		Store.Lng = this.map.Center.lng;
	}
	
	OnMapZoomEnd_Handler(ev) { 		
		Store.Zoom = this.map.Zoom;
	}
	
	OnMapClick_Handler(ev) {
		if (ev.features.length == 0) return;
		
		var html = Other.HTMLize(ev.features[0].properties, this.current.Fields, Core.Nls("Map_Not_Available"));
		
		this.map.InfoPopup(ev.lngLat, html);
	}
	
	OnSearchChange_Handler(ev) {		
		var legend = [{
			color : this.config.search.color,
			value : ["==", ["get", this.config.search.field], ev.item.id]
		}, {
			color : [255, 255, 255, 0]
		}]
		
		this.map.Choropleth([this.config.search.layer], 'line-color', legend, this.group.opacity.opacity);
		
		this.map.FitBounds(ev.item.extent, { padding:30, animate:false });
	}
}