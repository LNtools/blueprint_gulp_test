
function BarChart(data, opts){
    // console.log(data)
    var _self = this;
    
    _self.opts = opts;
    
    _self.color_bars = "#1e6bb8";
    
    _self.canvas = d3.select(opts.content)
        .append("div").attr("class", "canvas_bar");
    
    _self.scale = d3.scale.linear().range(_self.opts.range_bars);

    _self.tooltip = tooltipd3();
    
    _self.pushData = pushData;
    _self.update = update;

    pushData(data);
    
    function pushData(data){
        // data.map(function(d){
        //     console.log(d);
        // });
    
        
        _self.data=_.sortBy(data, function(d){ return -d.count; });

        _self.scale.domain([0, d3.max(_self.data, function(d){ return d.count; })]);

        _self.bar = _self.canvas.selectAll(".bar")
            .data(_self.data);
        
        var bar_enter = _self.bar.enter().append("div")
            // .attr("class", "bar")
            .attr("class", function(d){
                var nacional = check_exterior(d._id.bandera) ? "inter" : "nac";
                return ["bar", nacional, d._id.bandera].join(" ");
            })
            .call(build_bar);


        _self.bar.exit().remove();
        update();
    }
    
    function build_bar(){
        this.append("div")
            .attr("class", "bar_value")
            .html(function(d){
                return d.count;
            });

        this.append("div")
            .attr("class", function(d){
            var nacional = check_exterior(d._id.bandera) ? "inter" : "nac";
                return ["bar_label", nacional].join(" ");
            })
           .html(function(d){
                // console.log(d)
                return d._id.bandera;
            });


        // this.on("mouseover", function(d){
        //     var html = "<b class='titulo'>"+d._id.bandera+"</b><br>";
        //         html += "<b>Cantidad: </b> "+d.count+"<br>";
        //     _self.tooltip.mouseover(html); // pass html content
        // })
        // .on('mousemove', _self.tooltip.mousemove)
        // .on('mouseout', _self.tooltip.mouseout);
    }


    function update(){
        // var w = 100,
        var h = 600,
            body_w  = $("body").width(),
            padding = 20;
        if(body_w <= 425){
            h  = $("#map").height();
            // console.log(h)
        }
        
        var pos = (h - padding) / _self.bar.data().length;
        _self.bar
            // .style("height", function(d, i){
            //     return w+"px";
            // })
            .style("top", function(d, i){
                return pos * i + padding +"px";
            })
            .style("width", function(d, i){
                return _self.scale(d.count) +"%";
            })
            .style("left", function(d, i){
                return 0 +"px";
            })
            // .style("background", function(d, i){
            //     return _self.color_bars;
            // })
            ;
        
        
    }

    function check_exterior(n) {
        var extran = ["shell", "pdvsur"];
        var is_extran = extran.indexOf(n) >= 0 ? true : false;
        return is_extran;
    }

}
