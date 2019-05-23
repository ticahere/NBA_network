import {select} from 'd3'

export default function Tooltip(tooltipId, width){
  var tooltipId = tooltipId;
  select(".network-chart").append("<div class='tooltip' id='"+tooltipId+"'></div>");

  if(width){
    select("#"+tooltipId).css("width", width);
  }

  hideTooltip();

  function showTooltip(content, event) {
    select("#"+tooltipId).html(content);
    select("#"+tooltipId).show();

    updatePosition(event);
  }

  function hideTooltip(){
    select("#"+tooltipId).hide();
  }

  function updatePosition(event){
    var ttid = "#"+tooltipId;
    var xOffset = -50;
    var yOffset = 30;

    var toolTipW = select(ttid).width();
    var toolTipeH = select(ttid).height();
    var windowY = select(window).scrollTop();
    var windowX = select(window).scrollLeft();
    var curX = event.pageX;
    var curY = event.pageY;
    var ttleft = ((curX) < select(window).width() / 2) ? curX - toolTipW - xOffset*2 : curX + xOffset;
    if (ttleft < windowX + xOffset){
      ttleft = windowX + xOffset;
    }
    var tttop = ((curY - windowY + yOffset*2 + toolTipeH) > select(window).height()) ? curY - toolTipeH - yOffset*2 : curY + yOffset;
    if (tttop < windowY + yOffset){
      tttop = curY + yOffset;
    }
    select(ttid).css('top', tttop + 'px').css('left', ttleft + 'px');
  }

  return {
    showTooltip: showTooltip,
    hideTooltip: hideTooltip,
    updatePosition: updatePosition
  }
}
