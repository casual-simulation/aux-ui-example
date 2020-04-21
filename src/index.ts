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

async function start() {
    const user = {
        id: 'myUserId',
        username: 'username',
        name: 'name',
        token: 'token',
        isGuest: false,
    };

    const universeID = 'http://localhost:3000/dummy/unviverseId';

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

    const app = document.getElementById('app');
    const div = document.createElement('div');
    const pre = document.createElement('pre');

    app.appendChild(div);
    app.appendChild(pre);

    let subs = [] as Subscription[];

    // sim.helper.transaction(
    //     botAdded(
    //         createBot(undefined, {
    //             myCustomFunction: `@player.toast("hi")`,
    //         }, 'tempLocal')
    //     )
    // );

    subs.push(
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
            if (event.type === 'show_toast') {
                pre.innerText = event.message;
            }
        })
    );

    function updateDivText() {
        while (div.firstChild) {
            div.removeChild(div.firstChild);
        }

        const calc = sim.helper.createContext();
        for (let bot of sim.helper.objects) {
            if (!isBotInDimension(calc, bot, 'home')) {
                continue;
            }
            const btn = document.createElement('button');
            btn.addEventListener('click', () => {
                sim.helper.action('onClick', null);
            });
            btn.innerText = `${bot.values.auxLabel}: ${getBotSpace(bot)}`;

            div.appendChild(btn);
        }
    }

    function cleanup() {
        for (let sub of subs) {
            sub.unsubscribe();
        }
    }
}

start();
