import React from 'react';
import {ActionType} from "../OOP/enums/ActionType";
import {ITeam} from "../OOP/interfaces/ITeam";
import {ITeamColor} from "../OOP/interfaces/ITeamColor";
import Icon from "../components/Icon";
// @ts-ignore
import styles from './ActionSelectorModal.module.css';
import {IPlayer} from "../OOP/interfaces/IPlayer";

interface ActionSelectorModalProps {
    homeTeam: ITeam;
    homeRoster: IPlayer[];
    awayTeam: ITeam;
    awayRoster: IPlayer[];
    homeColor: ITeamColor;
    awayColor: ITeamColor;
    onActionSelect: (action: { type: ActionType, team: ITeamRoster }) => void;
    onCancel: () => void;
}

interface ITeamRoster extends ITeam {
    roster: IPlayer[]
}

const ActionSelectorModal: React.FC<ActionSelectorModalProps> = ({
                                                                     homeTeam,
                                                                     homeRoster,
                                                                     awayTeam,
                                                                     awayRoster,
                                                                     homeColor,
                                                                     awayColor,
                                                                     onActionSelect,
                                                                     onCancel
                                                                 }) => {

    const homeTeamWithRoster = {...homeTeam, roster: homeRoster} as ITeamRoster;
    const awayTeamWithRoster = {...awayTeam, roster: awayRoster} as ITeamRoster;


    return (
        <div className={styles.modalOverlay} onClick={(e) => e.stopPropagation()}>
            <div className={styles.actionModalContent}>
                <h3>Select Action</h3>

                {/* Home Team Actions */}
                <div className={styles.teamActions}>
                    {Object.values(ActionType).map((action) => (
                        <Icon
                            key={`home-${action}`}
                            type={action}
                            teamType="HOME"
                            teamColors={homeColor}
                            onClick={() => onActionSelect({type: action, team: homeTeamWithRoster})}
                        />
                    ))}
                </div>
                {/* Away Team Actions */}
                <div className={styles.teamActions}>
                    {Object.values(ActionType).map((action) => (
                        <Icon
                            key={`away-${action}`}
                            type={action}
                            teamType="AWAY"
                            teamColors={awayColor}
                            onClick={() => onActionSelect({type: action, team: awayTeamWithRoster})}
                        />
                    ))}
                </div>

                <button className={styles.cancelButton} onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default ActionSelectorModal;