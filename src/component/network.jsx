import React from 'react';
import * as d3 from 'd3'
import * as d3_force from 'd3-force'
import '../data/player.js'
import teamColor from '../util/color.js'
import dataset from '../data/player.js'
import Tooltip from '../util/tooltip.js'

class Network extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

     };
  }
  componentWillMount(){
  }
  componentDidMount() {
    this.drawChart()
  }

  componentWillUnmount() {
  }

  drawChart() {
    var margin = {
    		top: 20,
    		bottom: 50,
    		right: 30,
    		left: 50
    	};
    var width = 1080 - margin.left - margin.right;
    var height = 850 - margin.top - margin.bottom;
    // var tooltip = Tooltip("vis-tooltip")
    var imageURL= 'https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/'
    var seasonKey=['2003-04', '2004-05', '2005-06', '2006-07', '2007-08', '2008-09', '2009-10', '2010-11',
    '2011-12', '2012-13', '2013-14', '2014-15','2015-16','2016-17','2017-18']
    var circleRadius = 50;

    console.log(dataset, teamColor)

    //Create an SVG element and append it to the DOM
    var svgElement = d3.select(".network-chart")
              .append('svg')
              .attr("width",width)
              .attr("height",height)
    					.append("g")
    					.attr("transform","translate("+margin.left+","+margin.top+")");

    var nodes = dataset.nodes;
    var links = []
    nodes.map((r, i) => {
      for (var j = i + 1; j < nodes.length; j++) {
        var sameTeamYear = 0
        var team = ''
        var lastYear = ''
          seasonKey.map((key, ind) => {
            if (r.history[key] && r.history[key] === nodes[j].history[key]){
              sameTeamYear ++;
              team = r.history[key]
              lastYear = key
            } else if (team !== '') {
              links.push({'source': r.id, 'target': nodes[j].id, 'weight': sameTeamYear, 'team': team, 'year': lastYear})
              team = ''
              sameTeamYear = 0
            }
        })
        if (sameTeamYear > 0) links.push({'source': r.id, 'target': nodes[j].id, 'weight': sameTeamYear, 'team': team, 'year': lastYear})
      }
    })

    console.log(nodes, links)

    //Create Force Layout
    var simulation = d3_force.forceSimulation()
         .force("link", d3.forceLink().id(function(d,i) {
             return i;
         }).distance(function(link) {
               return  200 - link.weight * 8;
        }))
       .force("charge", d3.forceManyBody().strength(-100))
       .force("center", d3.forceCenter(width / 2,height / 2))
       .force('collision', d3.forceCollide().radius(circleRadius))
       .force("y", d3.forceY(height/2).strength(0.05))
       .force("x", d3.forceX(width/2).strength(0.05))

        simulation
            .nodes(dataset.nodes)
            .on("tick", ticked);

        simulation
          .force("link")
          .links(links)

        var nodeG = d3.select('svg')
          .attr('class', 'nodes-wrapper')




        function ticked() {

          // set position of link path

          var link = nodeG.selectAll(".link")
            .data(links)

          link
            .enter()
            .append("svg:path")
            .merge(link)
            .attr("stroke-width", function(d){ return d.weight; })
            .attr("class", "link")
            .attr("d", function(d) {
              var dx = d.target.x - d.source.x,
                  dy = d.target.y - d.source.y,
                  dr = Math.sqrt(dx * dx + dy * dy);
              return "M" +
                  d.source.x + "," +
                  d.source.y + "A" +
                  dr + "," + dr + " 0 0,1 " +
                  d.target.x + "," +
                  d.target.y;
          })

          link.exit().remove()

          var u = nodeG.selectAll('g').data(nodes)

          u.enter()
          .append('g')
          .merge(u)
          .attr('transform',d => "translate(" + d.x + "," + d.y +")")
          .attr('class', "nodes")
          .each((d, i, n) => {
            const playerImg = d3.select(n[i]).selectAll('image').data([d])
            const playerName = d3.select(n[i]).selectAll('text').data([d])
            const playerBar = d3.select(n[i]).selectAll('.bar').data([d])
            const playerBarLength = d3.select(n[i]).selectAll('.barLength').data([d])

            playerImg
              .enter()
              .append("svg:image")
              .merge(playerImg)
              .attr("xlink:href",  function(d){ return imageURL + d.pid + '.png' })
              .attr("x", - 35)
              .attr("y", - 45)
              .attr("height", 70)
              .attr("width", 70)

            playerName
              .enter()
              .append("text")
              .merge(playerName)
              .attr("dx", 0)
              .attr("dy", "2.3em")
              .attr("font-size", '12px')
              .attr('text-anchor', 'middle')
              .text(function(d){ return d.player; });

            playerBar
              .enter()
              .append("rect")
              .attr('class', '.bar')
              .merge(playerBar)
              .attr("x", -45)
              .attr("y", 32)
              .attr("height", 3)
              .attr("fill", '#efefef')
              .attr('width', function (d) {return 90})

            playerBarLength
              .enter()
              .append("rect")
              .attr('class', '.barLength')
              .merge(playerBarLength)
              .attr("x", -45)
              .attr("y", 32)
              .attr("height", 3)
              .attr("fill", teamColor[d.history['2017-18']])
              .attr('width', function (d) {return 90 * d.yos / 15})

            playerImg.exit().remove()
            playerName.exit().remove();
            playerBar.exit().remove();
            playerBarLength.exit().remove();

          })
          .call(d3.drag()
                  .on("start", dragstarted)
                  .on("drag", dragged)
                  .on("end", dragended));

          u.exit().remove()

        }

        //Add links to SVG


        //Add nodes to SVG
        // var node = svgElement.selectAll(".node")
        //       .data(nodes)
        //       .enter()
        //       .append("g")
        //       .attr("class", "node")
        //       .call(force.drag);





        //Add square to each node

        // var bar = node.append("rect")
        //         .attr({'x': -45, 'y': 32, 'height': 3})
        //         .attr("fill", '#efefef')
        //         .attr('width', function (d) {return 90})
        // var barLength = node.append("rect")
        //         .attr({'x': -45, 'y': 32, 'height': 3})
        //         .attr("fill", function (d) { return teamColor[d.history['2017-18']] })
        //         .attr('width', function (d) {return 90 * d.yos / 15})

        // //Add square to each node
        // var circles = node.append("circle")
        //         .attr('r', 50)
        //         .attr('cx', function (d) { return d.x })
        //         .attr('cy', function (d) {return d.y })
        //         .attr("stroke", function (d) { return teamColor[d.history['2017-18']] })
        //         .attr('stroke-width', function (d) {return d.yos / 2})
        //         .attr("fill", 'white' )


         // Append images
        //  var images = node.append("svg:image")
        //        .attr("xlink:href",  function(d){ return imageURL + d.pid + '.png' })
        //        .attr("x", function(d) { return -35;})
        //        .attr("y", function(d) { return -45;})
        //        .attr("height", 70)
        //        .attr("width", 70);
        //
        // node.on("mouseover", highlightNode)
        //       .on("mouseout", hideDetails)
        //       .on('click', showDetails)
        //
        // link.on('mouseover', showLinkDetails)
        //     .on('mouseout', hideLinkDetails)


        // function highlightNode (d,i) {
        //     if (link) {
        //       link.attr("class", function (l) {
        //         if (l.target.id == d.id || l.source.id == d.id) return 'link-highlight'
        //       else return 'link'});
        //     }
        //     // circles.attr('fill', function (n) {
        //     //   if (n.id == d.id) return '#e4e4e4'
        //     //   else return 'white'
        //     // })
        //     label.attr('font-weight', function (n) {
        //       if (n.id == d.id) return '600'
        //       else return '500'
        //     })
        // }
        //
        // function showDetails (d, i) {
        //   var content = '<p class="main title">' + d.player + '<p class="note">' + Object.keys(d.history).length + ' Seasons</p></p>'
        //     content += '<div class="flexbox_row">' + Object.keys(d.history).map((r, i) => {
        //       return '<div class="flexbox_column"><div class="year">'
        //       + r.substr(5, 7).replace('-', '') + '</div><div class="dot"></div><div>'
        //       + '<img class="team-icon" src="https://d2p3bygnnzw9w3.cloudfront.net/req/201807061/tlogo/bbr/' + d.history[r] + '-' + r.substr(0,2) + r.substr(5, 7) + '.png"/>' + '</div><div>'
        //       + d.history[r] + '</div></div>'
        //     }).join('') + '</div>'
        //     // tooltip.showTooltip(content,d3.event)
        // }
        //
        // function hideDetails (d, i) {
        //   // tooltip.hideTooltip()
        //   if (link) {
        //     link.attr("class", "link");
        //   }
        //   label.attr('font-weight', '500')
        // }
        //
        // function showLinkDetails (d, i) {
        //   console.log(d)
        //   var weightYear = Array.apply(null, {length: d.weight}).map(Number.call, Number)
        //   var content = '<p class="main title">' + d.weight + (d.weight > 1 ? ' Seasons ' : ' Season ') + '</p>'
        //     content += '<div class="flexbox_row">' + weightYear.map((r, i) => {
        //       var year = parseInt(d.year.substr(2, 4)) - weightYear.length + i + 2
        //       return '<div class="flexbox_column" style="width: 20px"><div class="year">'
        //       + year + '</div><div class="dot"></div></div>'
        //     }).join('') + '</div>'
        //     content += '<img class="team-icon" src="https://d2p3bygnnzw9w3.cloudfront.net/req/201807061/tlogo/bbr/' + d.team + '-' + d.year.substr(0,2) + d.year.substr(5, 7) + '.png"/>' + '</div><div>'
        //     content += '<div>' + d.team + '</div>'
        //
        //     // tooltip.showTooltip(content,d3.event)
        //
        //   link.attr("class", function (l) {
        //     if (l.target.id == d.target.id && l.source.id == d.source.id) return 'link-highlight'
        //     else return 'link'});
        // }
        //
        // function hideLinkDetails (d, i) {
        //   link.attr('class', 'link')
        //   // tooltip.hideTooltip()
        // }
        //
        //  //Add labels to each node
        //  var label = node.append("text")
        //          .attr("dx", 0)
        //          .attr("dy", "2.3em")
        //          .attr("font-size", '12px')
        //          .attr('text-anchor', 'middle')
        //          .text(function(d){ return d.player; });



        //This function will be executed for every tick of force layout
        // force.on("tick", function(){
        //   //Set X and Y of node
        //   node.attr("r", function(d){ return d.yos; })
        //     .attr("cx", function(d){ return d.x; })
        //     .attr("cy", function(d){ return d.y; });
        //
        //   //Set X, Y of link
        //   link.attr("d", function(d) {
        //       var dx = d.target.x - d.source.x,
        //           dy = d.target.y - d.source.y,
        //           dr = Math.sqrt(dx * dx + dy * dy);
        //       return "M" +
        //           d.source.x + "," +
        //           d.source.y + "A" +
        //           dr + "," + dr + " 0 0,1 " +
        //           d.target.x + "," +
        //           d.target.y;
        //   })

          // link.attr("x1", function(d){ return d.source.x; })
          // link.attr("y1", function(d){ return d.source.y; })
          // link.attr("x2", function(d){ return d.target.x; })
          // link.attr("y2", function(d){ return d.target.y; });
          //Shift node a little
            // node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
        // });
        //Start the force layout calculation
        // force.start();

    function dragstarted(d) {
      console.log('drag start',d)
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
      console.log("dragged", d3.event)
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

  }


  render() {

    return (
      <div className="network-chart-wrapper">
        <div className="network-chart"></div>
      </div>
    );
  }
}

export default Network;
