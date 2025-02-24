import React from 'react';
import {ActionType} from "../OOP/enums/ActionType";
import {ITeam} from "../OOP/interfaces/ITeam";
import {ITeamColor} from "../OOP/interfaces/ITeamColor";
import Icon from "../components/Icon";
// @ts-ignore
import styles from './ActionSelectorModal.module.css';

interface ActionSelectorModalProps {
    homeTeam: ITeam;
    awayTeam: ITeam;
    homeColor: ITeamColor;
    awayColor: ITeamColor;
    onActionSelect: (action: { type: ActionType, team: ITeam }) => void;
}

const ActionSelectorModal: React.FC<ActionSelectorModalProps> = ({
                                                                     homeTeam,
                                                                     awayTeam,
                                                                     homeColor,
                                                                     awayColor,
                                                                     onActionSelect
                                                                 }) => {
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.actionModalContent}>
                {/* Home Team Actions */}
                <div className={styles.teamActions}>
                    {Object.values(ActionType).map((action) => (
                        <Icon
                            key={`home-${action}`}
                            type={action}
                            teamType="HOME"
                            teamColors={homeColor}
                            onClick={() => onActionSelect({type: action, team: homeTeam})}
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
                            onClick={() => onActionSelect({type: action, team: awayTeam})}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ActionSelectorModal;