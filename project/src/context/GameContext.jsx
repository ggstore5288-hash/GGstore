import React, { createContext, useContext, useState, useEffect } from 'react';
import { gamesApi } from '../api/games';

const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refreshGames = () => setRefreshTrigger(prev => prev + 1);

    useEffect(() => {
        const loadGames = async () => {
            setLoading(true);
            try {
                const data = await gamesApi.getAll();
                setGames(data);
            } catch (error) {
                console.error("Failed to load games", error);
            } finally {
                setLoading(false);
            }
        };
        loadGames();
    }, [refreshTrigger]);

    const addGame = async (gameData) => {
        const newGame = await gamesApi.create(gameData);
        refreshGames();
        return newGame;
    };

    const updateGame = async (id, gameData) => {
        const updated = await gamesApi.update(id, gameData);
        refreshGames();
        return updated;
    };

    const deleteGame = async (id) => {
        await gamesApi.delete(id);
        refreshGames();
    };

    return (
        <GameContext.Provider value={{ games, loading, addGame, updateGame, deleteGame, refreshGames }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGames = () => useContext(GameContext);
