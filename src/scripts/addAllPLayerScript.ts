import {PlayerService} from "../OOP/services/PlayerService";
import {Player} from "../OOP/classes/Player";
import {Position} from "../OOP/enums/Position";

const dummyPlayers = [
    new Player('0', 'John Doe', Position.FORWARD, 25),
    new Player('0', 'Jane Smith', Position.DEFENDER, 23),
    new Player('0', 'Mike Johnson', Position.FORWARD, 28),
    new Player('0', 'Sarah Brown', Position.GOALIE, 30)
];

async function addAllPlayersToTeam(teamId: string, players: any) {
    for (const player of players) {
        await PlayerService.addPlayerToTeam(teamId, player);
    }
}

// Example usage
const teamId = 'your-team-id'; // Replace with your actual team ID
addAllPlayersToTeam(teamId, dummyPlayers)
    .then(() => {
        console.log('All players have been added to the team.');
    })
    .catch((error) => {
        console.error('Error adding players to the team:', error);
    });