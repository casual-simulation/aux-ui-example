import { BotManager } from '@casual-simulation/aux-vm-browser';
import { AuxConfigParameters } from '@casual-simulation/aux-vm';
import { SubscriptionLike } from 'rxjs';
import uuid from 'uuid/v4';

async function start() {
    const app = document.getElementById('app');
    const botList = document.getElementById('botList');
    const actionList = document.getElementById('actionList');
    const status = document.getElementById('status');
    const link = document.getElementById('link') as HTMLAnchorElement;

    // Create the user for this session.
    // This tells AUX what ID to use for the player bot
    // and how this session can be reached via remote() actions.
    //
    // See https://docs.casualsimulation.com/docs/actions#remoteaction-target
    // for some more info.
    const user = {
        id: uuid(),
        username: 'username',
        name: 'name',
        token: 'token',
    };

    // The ID of the universe that we are going to load.
    // Because we're loading from a separate auxPlayer, we
    // have to include the full URL.
    const universeID = 'https://auxplayer.com?auxUniverse=universeId';
    link.href = universeID;

    // The configuration that tells the universe some information
    // about the environment it is running in.
    const config = {
        // Information about the application.
        version: 'v1.0.0',
        versionHash: 'commitHash',

        // Information about the device.
        device: {
            supportsAR: false,
            supportsVR: true,
        },
    } as AuxConfigParameters;

    // Create a new simulation for the given user, universe ID, and configuration.
    const sim = new BotManager(user, universeID, config);

    // This triggers the initialization process for the simulation.
    // The promise resolves once the worker has been setup, but
    // the simulation might still have setup work to do afterwards.
    // Use the syncStateChanged observable to be notified when the simulation is completely setup.
    await sim.init();

    let initialized = false;
    let wasSynced = false;

    let subs = [
        // syncStateChanged is an event that is triggered
        // when the sync status changes.
        // A universe is considered "synced" when it has been initalized and connected to the server.
        // This is useful for telling whether the universe is likely to have recent data from the server.
        // Upon subscription, the first callback contains the current sync state.
        // Note that if the universe hits an error while initializing, the sync event will never fire.
        sim.connection.syncStateChanged.subscribe((synced) => {
            if (synced) {
                if (!initialized) {
                    // We're synced, but we haven't run the initialize code yet.
                    // At this point, it's safe to use every feature in the simulation.
                    initialize();
                    initialized = true;
                }
            }
            status.innerText = synced ? 'Connected!' : 'Disconnected.';
            wasSynced = synced;
        }),

        // connectionStateChanged is an event that is triggered
        // when the connection status to the server changes.
        // This is reflective of the actual network connection state between the server and the local client.
        // Useful for monitoring network status.
        // Upon subscription, the first callback contains the current connection state.
        sim.connection.connectionStateChanged.subscribe((connected) => {
            console.warn(connected ? 'Connected' : 'Disconnected');
        }),

        // botsDiscovered is an event that is triggered
        // whenever a bot is added to the universe.
        // Upon subscription, the first callback contains all
        // the existing bots.
        sim.watcher.botsDiscovered.subscribe((bots) => {
            updateDivText();
        }),

        // botsUpdated is an event that is triggered
        // whenever a bot is changed in the universe.
        sim.watcher.botsUpdated.subscribe((bots) => {
            updateDivText();
        }),

        // botsRemoved is an event that is triggered
        // whenever a bot is removed from the universe.
        sim.watcher.botsRemoved.subscribe((botIds) => {
            updateDivText();
        }),

        // Local events is triggered whenever a player action has been has been sent from a script.
        // Also includes other actions that don't modify the AUX data model.
        //
        // See https://docs.casualsimulation.com/docs/actions#player-actions
        // for a full list of player actions.
        sim.localEvents.subscribe((event) => {
            const li = document.createElement('li');
            li.innerText = `${event.type}`;
            actionList.appendChild(li);
        }),

        // Add the simulation itself to our subscriptions.
        sim,
    ] as SubscriptionLike[];

    // Helper function to update the UI with data from the simulation.
    // In a more complicated application, you would want to respond to
    // the discovered/removed/update events individually instead of
    // rebuilding the entire UI on each update.
    function updateDivText() {
        while (botList.firstChild) {
            botList.removeChild(botList.firstChild);
        }

        // Most of the data-related capabilities live in the "helper"
        // object in the simulation.
        // In this case, we're grabbing a list of all the bots in the simulation
        // and iterating over them.
        for (let bot of sim.helper.objects) {
            const li = document.createElement('li');
            li.innerText = bot.id;
            botList.appendChild(li);
        }
    }

    function initialize() {
        // TODO: Run any initialization code that you want.
        // Some Examples:
        // 1. Create a local temporary bot that contains some custom code
        // 2. Update the player bot with some login information
    }

    // Helper function to cleanup all the subscriptions.
    // This is useful for shutting down the simulation and all
    // the resources it is using.
    function cleanup() {
        for (let sub of subs) {
            sub.unsubscribe();
        }
    }
}

start();
