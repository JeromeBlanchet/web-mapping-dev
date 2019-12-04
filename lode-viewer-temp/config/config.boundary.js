var config = {
	style : "mapbox://styles/deil-leid/ck36tlip73asa1cn6of81gugz",
    layers: ["pr", "cd", "csd", "da", "db"],
	title : {
		"en" : "Population to Building Ratio",
		"fr" : "Proportion de population par bâtiment"
	},
    legend: [{
            color: [230, 230, 230],
            label: {
                en: "0 Buildings, 0 Population",
                fr: "0 bâtiments, 0 population"
            }
        }, {
            color: [204, 102, 153],
            label: {
                en: "0 Population",
                fr: "0 population"
            }
        }, {
            color: [204, 255, 51],
            label: {
                en: "0 Buildings",
                fr: "0 bâtiments"
            }
        }, {
            color: [255, 255, 204],
            label: {
                en: "Between 0 and 1.5",
                fr: "Entre 0 et 1.5"
            }
        }, {
            color: [161, 218, 180],
            label: {
                en: "Between 1.5 and 3",
                fr: "Entre 1.5 et 3"
            }
        }, {
            color: [65, 182, 196],
            label: {
                en: "Between 3 and 7",
                fr: "Entre 3 et 7"
            }
        }, {
            color: [44, 127, 184],
            label: {
                en: "Between 7 and 20",
                fr: "Entre 7 et 20"
            }
        }, {
            color: [37, 52, 148],
            label: {
                en: "More than 20",
                fr: "Plus de 20"
            }
        }
    ],
    toc: [{
            id: "pr",
            label: {
                en: "Province (PR)",
                fr: "Province (PR)"
            }
        }, {
            id: "cd",
            label: {
                en: "Census Division (CD)",
                fr: "Division de recensement (DR)"
            }
        }, {
            id: "csd",
            label: {
                en: "Census Subdivision (CSD)",
                fr: "Sous-division de recensement (SDR)"
            }
        }, {
            id: "da",
            label: {
                en: "Dissemination Area (DA)",
                fr: "Aire de diffusion (AD)"
            }
        }, {
            id: "db",
            label: {
                en: "Dissemination Block (DB)",
                fr: "Bloc de diffusion (BD)"
            }
        },
    ],
    selected: "da",
    classes: [
        'case',
        ['all', ['==', ['get', 'population'], 0], ['==', ['get', 'buildings'], 0]], '#color1',
        ['==', ['get', 'population'], 0], '#color2',
        ['==', ['get', 'buildings'], 0], '#color3',
        ['<', ['/', ['get', 'population'], ['get', 'buildings']], 1.5], '#color4',
        ['<', ['/', ['get', 'population'], ['get', 'buildings']], 3], '#color5',
        ['<', ['/', ['get', 'population'], ['get', 'buildings']], 7], '#color6',
        ['<', ['/', ['get', 'population'], ['get', 'buildings']], 20], '#color7',
        '#color8'
    ],
    fields: [{
            id: "uid",
            label: {
                en: "ID",
                fr: "ID"
            }
        }, {
            id: "name",
            label: {
                en: "Name",
                fr: "Nom"
            }
        }, {
            id: "name_en",
            label: {
                en: "Name (english)",
                fr: "Nom (anglais)"
            }
        }, {
            id: "name_fr",
            label: {
                en: "Name (french)",
                fr: "Nom (français)"
            }
        }, {
            id: "population",
            label: {
                en: "Population",
                fr: "Population"
            }
        }, {
            id: "buildings",
            label: {
                en: "Buildings",
                fr: "Bâtiments"
            }
        }, {
            id: "ratio",
            label: {
                en: "Ratio",
                fr: "Proportion"
            },
			polish: ["/", "population", "buildings"]
        }
    ]
}

export default config;
