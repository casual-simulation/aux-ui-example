import { BotManager } from '@casual-simulation/aux-vm-browser';
import { Simulation, AuxConfigParameters } from '@casual-simulation/aux-vm';
import {
    PrecalculatedBot,
    getBotSpace,
    toast,
    botAdded,
    createBot,
    isBotInDimension,
} from '@casual-simulation/aux-common';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
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
    const user = {
        id: uuid(),
        username: 'username',
        name: 'name',
        token: 'token',
        isGuest: false,
    };

    // The ID of the universe that we are going to load.
    //
    const universeID = 'http://localhost:3000/dummy/unviverseId';
    link.href = 'https://auxplayer.com?auxUniverse=universeId';

    const config = {
        version: 'v1.0.0',
        versionHash: 'commitHash',
        device: {
            supportsAR: false,
            supportsVR: true,
        },
        isBuilder: false,
        isPlayer: true,
        builder: null,
    } as AuxConfigParameters;

    const sim = new BotManager(user, universeID, config);

    await sim.init();

    let subs = [] as Subscription[];

    let initialized = false;
    let wasSynced = false;

    subs.push(
        sim.connection.syncStateChanged.subscribe((synced) => {
            if (synced) {
                if (!initialized) {
                    initialize();
                    initialized = true;
                }
            }
            status.innerText = synced ? 'Connected!' : 'Disconnected.';
            wasSynced = synced;
        }),
        sim.watcher.botsDiscovered.subscribe((bots) => {
            updateDivText();
        }),
        sim.watcher.botsUpdated.subscribe((bots) => {
            updateDivText();
        }),
        sim.watcher.botsRemoved.subscribe((botIds) => {
            updateDivText();
        }),
        sim.localEvents.subscribe((event) => {
            const li = document.createElement('li');
            li.innerText = `${event.type}`;
            actionList.appendChild(li);
        })
    );

    function updateDivText() {
        while (botList.firstChild) {
            botList.removeChild(botList.firstChild);
        }

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

    function cleanup() {
        for (let sub of subs) {
            sub.unsubscribe();
        }
    }
}

start();
