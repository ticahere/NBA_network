import React from 'react';
import * as d3 from 'd3'
import * as d3_force from 'd3-force'
import d3_tip from 'd3-tip'
import '../data/player.js'
import teamColor from '../util/color.js'
import dataset from '../data/player.js'
import playerid from '../data/playerid.js'

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
    var targetID = null;
    var tooltip = d3_tip()
      .attr('class', 'tooltip')
      .offset([-5, 40])

    var imageURL= 'https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/'
    var seasonKey=['2003-04', '2004-05', '2005-06', '2006-07', '2007-08', '2008-09', '2009-10', '2010-11',
    '2011-12', '2012-13', '2013-14', '2014-15','2015-16','2016-17','2017-18','2018-19']
    var circleRadius = 50;

    //Create an SVG element and append it to the DOM
    var nodeElement = d3.select(".network-chart")
              .append('svg')
              .attr("width",width)
              .attr("height",height)
    					.append("g")
              .attr('class', 'nodes-wrapper')
    					.attr("transform","translate("+margin.left+","+margin.top+")")
              .call(tooltip);


    var nodes = dataset.nodes;
    var playerData = playerid.data
    var links = []
    nodes.map((r, i) => {
      var yos = 0
      // calculate yos
      seasonKey.map((yr) => {
        if (r[yr] !=="NP") {
          yos ++
        }
      })
      // find player id
      playerData.map((player) => {
        var name = player['firstName'] + ' ' + player['lastName']
        if (name == r['player']){
          r["pid"] = player['playerId']
        }
      })

      r["yos"] = yos
      for (var j = i + 1; j < nodes.length; j++) {
        var sameTeamYear = 0
        var team = ''
        var lastYear = ''
          seasonKey.map((key, ind) => {
            if (r[key] === nodes[j][key] && r[key]!== "NP"){
              sameTeamYear ++;
              team = r[key]
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



        function ticked() {

          // set position of link path
          var link = nodeElement.selectAll(".link")
            .data(links)

          link
            .enter()
            .append("svg:path")
            .merge(link)
            .attr("stroke-width", function(d){ return d.weight; })
            .attr("class","link")
            .classed("link-highlight", d=> targetID === d.source.id || targetID === d.target.id? true : false)
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
            .on('mouseover', function (d) {
              d3.select(this)
                .attr("class", function (l) {
                  if (l.target.id == d.target.id && l.source.id == d.source.id) return 'link-highlight'
                  else return 'link'
                });
              tooltip.html(getLinkContent(d)).show(d, this)
            })
            .on('mouseout', function (d)  {
              d3.select(this).attr("class", "link")
              tooltip.hide(this)
            })


          link.exit().remove()

          var u = nodeElement.selectAll('g').data(nodes)

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
              .on("mouseover", function (d) { targetID= d.id})
              .on("mouseout", function (d) { targetID= null; tooltip.hide(this)})
              .on("click", function(d) {
                tooltip.html(getNodeContent(d)).show(d, this)
              })

            playerName
              .enter()
              .append("text")
              .merge(playerName)
              .attr("dx", 0)
              .attr("dy", "2.3em")
              .attr("font-size", '12px')
              .attr('text-anchor', 'middle')
              .attr('font-weight', d=> d.id === targetID ? 600 : 500)
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
              .attr("fill", teamColor[d['2017-18']])
              .attr('width', function (d) {return 90 * d.yos / 15})

            playerImg.exit().remove()
            playerName.exit().remove();
            playerBar.exit().remove();
            playerBarLength.exit().remove();

          })
          .call(d3.drag()
                  .on("start", dragstarted)
                  .on("drag", dragged)
                  .on("end", dragended))

          u.exit().remove()

        }
        function getLinkContent(d) {
          var weightYear = Array.apply(null, {length: d.weight}).map(Number.call, Number)
          var content = '<p class="main title">' + d.weight + (d.weight > 1 ? ' Seasons ' : ' Season ') + '</p>'
            content += '<div class="flexbox_row">' + weightYear.map((r, i) => {
              var year = parseInt(d.year.substr(2, 4)) - weightYear.length + i + 2
              return '<div class="flexbox_column" style="width: 20px"><div class="year">'
              + year + '</div><div class="dot"></div></div>'
            }).join('') + '</div>'
            content += '<img class="team-icon" src="https://d2p3bygnnzw9w3.cloudfront.net/req/201807061/tlogo/bbr/' + d.team + '-' + d.year.substr(0,2) + d.year.substr(5, 7) + '.png"/>' + '</div><div>'
            content += '<div>' + d.team + '</div>'
            return content
        }

        function getNodeContent(d) {
          var content = '<p class="main title">' + d.player + '<p class="note">' + Object.keys(d).length + ' Seasons</p></p>'
            content += '<div class="flexbox_row">' + seasonKey.map((r, i) => {
              if (d[r]!=="NP"){
                return '<div class="flexbox_column"><div class="year">'
                + r.substr(5, 7).replace('-', '') + '</div><div class="dot"></div><div>'
                + '<img class="team-icon" src="https://d2p3bygnnzw9w3.cloudfront.net/req/201807061/tlogo/bbr/' + d[r] + '-' + r.substr(0,2) + r.substr(5, 7) + '.png"/>' + '</div><div>'
                + d[r] + '</div></div>'
              }
            }).join('') + '</div>'
            return content
        }

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
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
        <h2>NBA Top Players Network</h2>
        <div className="subtitle">Explore who play with whom, how long they have played, and which team they played for.</div>

        <div className="network-chart"></div>
        <div className="tooltip-chart"></div>
      </div>
    );
  }
}

export default Network;
