
function MapChart(id) {

    var _self = this;

    _self.opts = {content:id};

    var _opts_map =  {
                // minZoom:2,
                // maxZoom:2,
                // dragging:false,
                // scrollWheelZoom: false,
                // touchZoom:false,
                // boxZoom:true,
                // continuousWorld:true
            };

    _self.tooltip = tooltipd3();

    _self.map = L.map(_self.opts.content, _opts_map)
        .setView([32, -15], 8);

    /** Make leaflet map */
    // var mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
    // var attribution= 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>';
    // L.tileLayer(
    //     // 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    //     // 'http://{s}.sm.mapstack.stamen.com/(toner-lite,$fff[difference],$fff[@23],$fff[hsl-saturation@20])/{z}/{x}/{y}.png',
    //     'https://{s}.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={token}',
    //     {
    //         id: 'cbertelegni.i7iigf65',
    //         token:'pk.eyJ1IjoiY2JlcnRlbGVnbmkiLCJhIjoiY2lyd2R1eHI5MGoxdmZsbTg2dXNzbDV6YyJ9.Tywz28Zzyym3KGPrsFaalw',
    //         // maxZoom: 8,
    //         attribution: attribution
    //     }).addTo(_self.map);
    var cdn_proxy = "http://olcreativa.lanacion.com.ar/dev/get_url/img.php?img=";
    var mapboxUrl = cdn_proxy+"https://{s}.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={token}";
    L.tileLayer(mapboxUrl, {
            id: "lanacionmapas.363845a0", 
            token: "pk.eyJ1IjoibGFuYWNpb25tYXBhcyIsImEiOiJjaWdhNm5zYjIwNHZ4dHRtMXRzOHU0cWU3In0.K8BvqeEt2V2xrXL5Tk7snQ"
        }).addTo(_self.map);

    /* Initialize the SVG layer */
    _self.map._initPathRoot();

    function projectPoint(x, y) {
        var point = _self.map.latLngToLayerPoint(new L.LatLng(y, x));
        this.stream.point(point.x, point.y);
    }
    var transform = d3.geo.transform({point: projectPoint});
    _self.path = d3.geo.path().projection(transform);



    /* We simply pick up the SVG from the map object */
    var svg = d3.select("#"+_self.opts.content).select("svg");
    _self.g = svg.append("g");


    _self.map.on("viewreset", function(){ _self.update(); });
    // _self.map.on("zoomend", function(){ _self.update(); });
    _self.map.on("zoomlevelschange", function(){ _self.update(); });

}

MapChart.prototype.makePointID = function(d) {
    var pat = /\.|\,|\-|\s|\(|\)|\?|\¿/gi;
    var _id = d.domicilio.trim().replace(pat, "_");
    _id += d.localidad.trim().replace(pat, "_");
    return _id;
};

/** update dataset */
MapChart.prototype.pushData = function(_data) {
    var _self = this;
    // _self.data = _data;
        /** parse data */
    // console.log(_data)
    _self.dataHeat = [];
    _self.data = _data.map(function(d) {
                    // Add a LatLng object to each item in the dataset
                    _self.dataHeat.push([d.loc[0], d.loc[1], Math.random()*1000]);
                    d.loc = new L.LatLng(d.loc[0], d.loc[1]);
                    d.point_id = _self.makePointID(d);
                    // debugger
                    return d;
                });
    // _self.c10 = d3.scale.category10();
    /** Udate scale for this dataset */
    // _self.scale_radio = d3.scale.linear()
    //     .domain([0, d3.max(_data, function(d){ return d.total; })])
    //     .range([3, 20]);

    /** select all circles on the map */
    _self.feature = _self.g.selectAll(".circle")
        .data(_self.data);

    /** enter new circles */
    _self.feature.enter()
        .append("circle")
        .attr("class", function(d){
            var nacional = _self.check_exterior(d.bandera) ? "inter" : "nac";
            return ["circle", d.bandera, d.point_id, nacional].join(" ");
        })
        //.style("stroke", "black")
        .call(fn_events_tootip)
        ;

    _self.feature.exit().remove();
    _self.update();


    // var heat = L.heatLayer(_self.dataHeat, {
    //     radius : 15, // default value
    //     blur : 25, // default value
    //      gradient: {
    //         0.0: 'green',
    //         0.5: 'yellow',
    //         1.0: 'red'
    //     } // Values can be set for a scale of 0-1
    // }).addTo(_self.map);


    return _self;

    function fn_events_tootip(){
        this.on("mouseover", function(d){
            var html = "<b class='titulo'>"+d.bandera+"</b><br>";

                html += "<p class='dir'>"+d.domicilio+"</p>";
                if(d.geojson){
                    if(_self.map.getZoom() >= 6){
                        // html += "<img src='https://maps.googleapis.com/maps/api/streetview?size=200x100&location="+ d.geojson.coordinates.join(",")+"&heading=0&pitch=-0.76&key=AIzaSyA4rAT0fdTZLNkJ5o0uaAwZ89vVPQpr_Kc' />";
                    }
                    var goo = "http://maps.google.com/maps?q=&layer=c&cbll="+d.geojson.coordinates.join(",")+"&cbp=11,0,0,0,0";
                    html += "<p class='aviso'>Doble clic para ir a<br> <a href='"+goo+"' target='_blanc'>Google Street View</a></p> ";
                }

            _self.tooltip.mouseover(html); // pass html content
            // console.log(d)
        })
        .on('mousemove', _self.tooltip.mousemove)
        .on('mouseout', _self.tooltip.mouseout);

        // this.on('click', function(d){
        //     console.log(d.point_id);
        //     _self.update_bounding_map("."+d.point_id);
        // });
        this.on('dblclick', function(d){
            var goo = "http://maps.google.com/maps?q=&layer=c&cbll="+d.geojson.coordinates.join(",")+"&cbp=11,0,0,0,0";
            window.open(goo);
        });
    }
};

MapChart.prototype.filter_points = function(_class) {
    var _self = this;
    var duration = 100;
    _self.feature
        // .style("display", "block");
        // .transition()
        // .duration(100)
        .style("opacity", 1);

    if(_class){
        _self.feature
            .filter(":not("+_class+")")
            // .transition()
            // .duration(duration)
            .style("opacity", 0);
    }
    
    // setTimeout(function(){; });
   _self.update_bounding_map(_class);


};

MapChart.prototype.check_exterior = function(n) {
    var extran = ["shell", "pdvsur"];
    var is_extran = extran.indexOf(n) >= 0 ? true : false;
    return is_extran;
};


MapChart.prototype.update = function() {
        var _self = this;
        var zoom  = _self.map.getZoom();
        var radio = 0.45;
        
        if(zoom <= 4){
            radio = 0.50;
        }
        
        if(zoom <= 3){
            radio = 0.4;
        }

        if(zoom >= 16){
            radio = 1.2;
        }
        // console.log("zoom: %s", zoom);
        // console.log("radio: %s", radio);
        
        radio = radio *zoom;

        _self.g.selectAll(".circle")
            .attr("transform", function(d) {
                return "translate("+ 
                    _self.map.latLngToLayerPoint(d.loc).x +","+ 
                    _self.map.latLngToLayerPoint(d.loc).y +")";
                })
            .transition()
            .attr("r", function(d){ 
                return radio; 
            })
            ;

        // _self.update_bounding_map();

        return _self;
};

MapChart.prototype.update_bounding_map = function(_class) {

    var _self = this;
    var arr_points;
    if(_class){
        arr_points = _self.feature.filter(_class).data().map(function(d){ return d.loc; });
    }else{
        arr_points = _self.data.map(function(d){ return d.loc; });
    }
    var bounds = new L.LatLngBounds(arr_points);
    _self.map.fitBounds(bounds);
    _self.map.invalidateSize();
    return _self;
};
