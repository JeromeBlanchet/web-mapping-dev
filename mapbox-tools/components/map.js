import Core from '../../basic-tools/tools/core.js'
import Evented from '../../basic-tools/components/evented.js'

export default class Map extends Evented {
				
	static set Token(value) { mapboxgl.accessToken = value; }
	
	static get Token() { return mapboxgl.accessToken; }
	
	get Container() {
		return this.map._container;
	}
	
	get Center() {
		return this.map.getCenter();
	}
	
	set Center(value) {
		this.map.setCenter(value)
	}
	
	get Zoom() {
		return this.map.getZoom();
	}
	
	set Zoom(value) {
		this.map.setZoom(value)
	}
	
	get Style() {
		return this.style;
	}
	
	constructor(options) {
		super();
		
		this.layers = [];
		this.original = {};
		this.maxExtent = [[-162.0, 41.0], [-32.0, 83.5]];
		this.style = options.style;
		
		this.click = this.OnLayerClick_Handler.bind(this);;
		
		this.map = new mapboxgl.Map(options); 
		
		// Set the maximum bounds of the map
		this.SetMaxBounds(this.maxExtent);

		this.map.once('styledata', this.OnceStyleData_Handler.bind(this));
		
		// this.map.on('click', this.click);
		
		this.WrapEvent('moveend', 'MoveEnd');
		this.WrapEvent('zoomend', 'ZoomEnd');
		this.WrapEvent('load', 'Load');
		
		this.map.once('load', ev => {
			// Fix for improve this map in french
			this.map.getContainer().querySelector('.mapbox-improve-map').innerHTML = Core.Nls("Mapbox_Improve");
		})
	}
	
	AddSource(name, data) {
		this.map.addSource('odhf', data);
	}
	
	AddControl(control, location) {
		this.map.addControl(control, location);
	}
	
	InfoPopup(lngLat, html) {	
		var popup = new mapboxgl.Popup({ closeOnClick: true })
								.setLngLat(lngLat)
								.setHTML(html)
								.addTo(this.map);
					
		popup._closeButton.innerHTML = '<i class="fa fa-times" aria-hidden="true"></i>';
		popup._closeButton.setAttribute('aria-label', Core.Nls('Mapbox_Close_Popup'));
		popup._closeButton.title = Core.Nls('Mapbox_Close_Popup');
	}
	
	Reset(layers) {
		layers.forEach(l => {
			this.map.setPaintProperty(l, 'fill-color', this.original[l])
		});
		
		this.original = {};
	}
	
	/**
	 * Retrieves the layer type 
	 * @param {string} layerId - id of the map layer
	 */
	GetLayerType(layerId) {
		const layer = this.map.getLayer(layerId);
		let layerType;

		if (layer.type) {
			layerType = layer.type;
		}

		return layerType;
	}

	/**
	 * Get the layer color paint property name based on layer type
	 * @param {string} layerType - The layer type 
	 */
	GetLayerColorPropertyByType(layerType) {
		let layerPaintProperty;

		switch (layerType) {
			case 'circle':
				layerPaintProperty = 'circle-color';
				break;
			case 'line':
				layerPaintProperty = 'line-color';
				break;
			case 'fill':
				layerPaintProperty = 'fill-color';
				break;
			case 'symbol':
				layerPaintProperty = 'icon-color';
				break;
			case 'background':
				layerPaintProperty = 'background-color';
				break;
			case 'heatmap':
				layerPaintProperty = 'heatmap-color';
				break;
			case 'fill-extrusion':
				layerPaintProperty = 'fill-extrusion-color';
				break;
			default:
				layerPaintProperty = 'circle-color';
		}		

		return layerPaintProperty;
	}

	/**
	 * Method to update a style property for a layer
	 * @param {string} layerId - Name of the map layer
	 * @param {string} paintProperty - Paint Property of the map layer
	 * @param {array || string} styleRules - Mapbox expression of style rules or a rgba string value.
	 */
	SetPaintProperty(layerId, paintProperty, styleRules) {
		// Check that layer exists in map
		if (this.map.getLayer(layerId)) {
			this.map.setPaintProperty(layerId, paintProperty, styleRules);
		}
	}

	/*This is used with an array of colors and (single opacity or array of opacity values)*/
	Choropleth(layers, property, legend, opacity) {
		var classes = ['case'];

		if(Array.isArray(opacity) && Array.isArray(legend) && legend.length > 1){
			legend.forEach(function(l, index) {			
			var color = l.color.length == 3 ? `rgba(${l.color.join(',')},${opacity[index]})` : `rgba(${l.color.join(',')})`;
			
			if (l.value) classes.push(l.value);
			
			classes.push(color);
		});
		}
		else if(!Array.isArray(opacity) &&  Array.isArray(legend) && legend.length > 1) {
			legend.forEach(function(l) {			
			var color = l.color.length == 3 ? `rgba(${l.color.join(',')},${opacity})` : `rgba(${l.color.join(',')})`;
			
			if (l.value) classes.push(l.value);
			
			classes.push(color);
		});
		}
		layers.forEach(l => {
			this.original[l] = this.map.getPaintProperty(l, property);
			this.SetPaintProperty(l, property, classes);
		});
	}

	/*This is used with a single color value and an array of opacity values)*/
	ChoroplethVarOpac(layers, property, legend, opacity) {
		var col = [0,0,0];
		var classes = ['case'];

		if (property === 'text-halo-color') {
			col = [255,255,255];
		}

		if(Array.isArray(opacity) && Array.isArray(legend) && legend.length > 1){
			legend.forEach(function(l, index) {			
			
			var color = `rgba(${col.join(',')},${opacity[index]})`;
			
			if (l.value) classes.push(l.value);
			
			classes.push(color);
		});
		}

		layers.forEach(l => {
			this.original[l] = this.map.getPaintProperty(l, property);
			this.SetPaintProperty(l, property, classes);
		});
	}

	ReorderLayers(layers) {
		layers.forEach(l => this.map.moveLayer(l));
	}
	
	GetLayer(layer) {
		return this.map.getLayer(layer) || null;
	}
	
	ShowLayer(layer) {
		this.map.setLayoutProperty(layer, 'visibility', 'visible');
	}
	
	HideLayer(layer) {
		this.map.setLayoutProperty(layer, 'visibility', 'none');
	}
	
	HideLayers(layers) {
		layers.forEach(l => this.HideLayer(l));
	}
	
	ShowLayers(layers) {
		layers.forEach(l => this.ShowLayer(l));
	}
	
	FitBounds(bounds, options) {		
		this.map.fitBounds(bounds, options);
	}

	SetMaxBounds(bounds) {
		this.map.setMaxBounds(bounds);
	}

	SetStyle(style) {
		this.style = style;
		
		this.map.once('styledata', this.OnceStyleData_Handler.bind(this))
		
		this.map.setStyle(style);
	}
	
	SetClickableMap(layers) {				
		this.map.on('click', this.click);
	}
	
	SetClickableLayers(layers) {
		layers.forEach(l => this.map.off('click', l, this.click)); 
		
		this.layers = layers;
		
		this.layers.forEach(l => this.map.on('click', l, this.click));
	}
	
	QueryRenderedFeatures(point, layers) {
		return this.map.queryRenderedFeatures(point, { layers: layers });
	}
	
	OnceStyleData_Handler(ev) {
		this.Emit('StyleChanged', ev);
	}
	
	OnLayerClick_Handler(ev) {
		this.Emit('Click', ev);
	}
	
	WrapEvent(oEv, nEv) {
		var f = (ev) => this.Emit(nEv, ev);
		
		this.map.on(oEv, f);
	}
}
