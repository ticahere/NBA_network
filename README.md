# NBA Network

Network chart of NBA players with React + D3 v4

Basketball is all about team. We love top NBA players because they play hard to fight for their team's win. However, we don't yet have an easy way to explore how they are connected to each other, especially for those top players it's very interesting to see when and where they play together.

![NBA Network](./src/image/1_overview.png "NBA Network")

NBA Network for top NBA players provides an easy view for fans to explore who play with whom, how long they have played, and which team they played for.

## 1. Player

The top level is seeing all your favorite players. The horizontal bar shows the relative playing history length, and the color represent the current team color, e.g. Lebron James has played longest 16 seasons and is now at Lakers. Thus the purple long bar visually represent this fact and allows easy comparison across all players.

![NBA Network Player Info](./src/image/2_player_info.png "NBA Network Player Info")

You can mouseover a player to see detailed playing history in a tooltip, which shows how many seasons and which teams he played for.


## 2. Teammate

Second level is exploring their teammates. You can click on one player and the players he has played with will be highlighted. Hovering over the link will bring up a tooltip with seasons and teams information that 2 players played together.

![NBA Network Player Links](./src/image/3_player_links.png "NBA Network Player Links")

Finally, the thickness of the curved links represents the number of seasons with teammates, which helps viewers to compare easily and draws attention to particular thick links, such as 8 seasons Westbrook and Durant played together in Thunder.

For example, Tobias Harris has played with 7 players in the network chart, including Lou Williams, Victor Oladipo, Nikola Vucevic, etc. Harris played 3 seasons in Orlando Magic with Vucevic from 2013-15.

![NBA Network Teammate Info](./src/image/4_teammate_info.png "NBA Network Teammate Info")

The data was collected from basketball-reference in 2018-19 season top player list.

https://www.basketball-reference.com/leagues/NBA_2019_per_game.html


# Installing
To run this project, use the following command.

`npm install`

`npm run start`
