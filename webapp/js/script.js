

var map;
var ctxt;
$(function(){

    
    var pymChild =  new pym.Child();

    ctxt = {filter: null};
    // var url = 'http://localhost:8888/eess?q={"bandera":"esso"}';
    // var url_eess = "http://localhost:8888/eess?q={}";
    var url_eess = "data/data.json";
    d3.json(url_eess, function(e, data){
        if(e){
            // console.log(e);
            return e;
        }

        map = new MapChart('map');
        map.pushData(data).update_bounding_map();

        pymChild.sendHeight();

    });
    // var url_eess_marcas = "http://localhost:8888/eess/groups";
    var url_eess_marcas = "data/data_banderas.json";
    d3.json(url_eess_marcas, function(e, data){
        if(e){
            // console.log(e);
            return e;
        }
        var opts ={
            content: "#line_chart_banderas",
            range_bars: [1, 100]
        };

        barchart = new BarChart(data, opts);
        barchart.bar.on("click", function(d){ 
            
            if(ctxt.filter === d._id.bandera){
                ctxt.filter = null;
                
                _gaq.push(['_trackEvent', 'eess_map', 'click_bar', "clear_click_bar"]);
                
            }else{
                ctxt.filter = d._id.bandera;
                _gaq.push(['_trackEvent', 'eess_map', 'click_bar', ctxt.filter]);
            }

            update();

        });
        // map.pushData(data).update_bounding_map();

        d3.selectAll("#nav button").on("click", click_change_nac);
    
        function click_change_nac (d){
            
            // if(d3.select(this).classed("active")){
            if(this.id === ctxt.filter || this.id === "all"){
                ctxt.filter = null;
                _gaq.push(['_trackEvent', 'eess_map', 'click_button_nav', "clear_button_nav"]);
            }else{
                ctxt.filter = this.id;
                _gaq.push(['_trackEvent', 'eess_map', 'click_button_nav', ctxt.filter]);
                
            }
            update();
        }

        update();
    });


    function update(){
        var filter_class = ctxt.filter ? "."+ctxt.filter : null;
        
        d3.selectAll(".active").classed("active", false);
        d3.selectAll("button").classed("active", false);
        d3.selectAll(".unactive").classed("unactive", false);

        if(filter_class){
            d3.selectAll(filter_class).classed("active", true);
            d3.selectAll(".bar:not("+filter_class+")").classed("unactive", true);
        }else{
            d3.selectAll("#inter, #nac").classed("active", false);
            
        }
        if (map){

            map.filter_points(filter_class);
            barchart.update();
        }

        // _gaq.push(['_trackEvent', 'eess_map', 'filter_by', filter_class]);

        pymChild.sendHeight();

    }

    var doit;
    window.onresize = function(d) {
      clearTimeout( doit );
      doit = setTimeout( function(){ 
            update();
            // pymChild.sendHeight(); 
        }, 200 );
    };


  
});

