import { AccessToken, ClientCredentialsAuthProvider, RefreshingAuthProvider } from '@twurple/auth';
import { ApiClient, HelixEventSubApi, HelixUserApi } from '@twurple/api';
import { ChatClient, ChatSubInfo, UserNotice } from '@twurple/chat';
import { EventSubListener } from '@twurple/eventsub';
import { TwitchPrivateMessage } from '@twurple/chat/lib/commands/TwitchPrivateMessage';
import { NgrokAdapter } from '@twurple/eventsub-ngrok';
import { env } from './environment';
import { promises as fs } from 'fs';
import { client, twitchChannel } from '.';
import { MessageEmbed } from 'discord.js';

export interface TokenData {
	accessToken: string,
	refreshToken: string,
	expiresIn: number | null,
	obtainmentTimestamp: number
};

export class TwitchIntegration {

	static TWITCH_ACCESS_TOKEN = '';
	static TWITCH_REFRESH_TOKEN: string | null = '';
	static TWITCH_EXPIRES_IN: number | null = 0;
	static TWITCH_OBTAINMENT_TIMESTAMP = 0;
	
	constructor(tokenData: TokenData) {
		TwitchIntegration.TWITCH_ACCESS_TOKEN = tokenData.accessToken;
		TwitchIntegration.TWITCH_REFRESH_TOKEN = tokenData.refreshToken;
		TwitchIntegration.TWITCH_EXPIRES_IN = tokenData.expiresIn;
		TwitchIntegration.TWITCH_OBTAINMENT_TIMESTAMP = tokenData.obtainmentTimestamp;
	}

	async init() {
		const clientCredentials = new ClientCredentialsAuthProvider(env.TWITCH_CLIENT_ID, env.TWITCH_CLIENT_SECRET);

		const authProvider = new RefreshingAuthProvider({ 
			clientId: env.TWITCH_CLIENT_ID, 
			clientSecret: env.TWITCH_CLIENT_SECRET,
			onRefresh: async (token: AccessToken) => {
				TwitchIntegration.TWITCH_ACCESS_TOKEN = token.accessToken;
				TwitchIntegration.TWITCH_REFRESH_TOKEN = token.refreshToken;
				await fs.writeFile('./twitch-tokens.json', JSON.stringify(token, null, 4), { encoding: 'utf-8' });
			}
		}, {
			accessToken: TwitchIntegration.TWITCH_ACCESS_TOKEN,
			refreshToken: TwitchIntegration.TWITCH_REFRESH_TOKEN,
			expiresIn: TwitchIntegration.TWITCH_EXPIRES_IN,
			obtainmentTimestamp: TwitchIntegration.TWITCH_OBTAINMENT_TIMESTAMP
		});
		
		const apiClientWithScopes = new ApiClient({ authProvider });
		const apiClient = new ApiClient({ authProvider: clientCredentials });
		// const adapter = new DirectConnectionAdapter({
		// 	hostName: env.SSL_HOSTNAME,
		// 	sslCert: {
		// 		key: env.SSL_KEY,
		// 		cert: env.SSL_CERT
		// 	}
		// });

		const listener = new EventSubListener({ apiClient, adapter: new NgrokAdapter(), secret: env.LISTENER_SECRET });
		await listener.listen();

		const helixUserApi = new HelixUserApi(apiClient);
		const helixSubApi = new HelixEventSubApi(apiClient);
		await helixSubApi.deleteAllSubscriptions();
		
		const user = (await helixUserApi.getUserByName('thebadgameruk'))!;

		const offlineSubscription = await listener.subscribeToStreamOfflineEvents(user, async e => {
			await twitchChannel.send(`${e.broadcasterDisplayName} just went offline`);
			client.user?.setActivity();
		});
		
		const onlineSubscription = await listener.subscribeToStreamOnlineEvents(user, async e => {
			const stream = await e.getStream();
			const broadcaster = await e.getBroadcaster();
			const image = stream.getThumbnailUrl(1920, 1080);
			const liveEmbed = new MessageEmbed()
				.setDescription(`https://www.twitch.tv/${e.broadcasterDisplayName}`)
				.setThumbnail(broadcaster.profilePictureUrl)
				.setTimestamp()
				.setColor('#9146FF')
				.setImage(image)
				.setTitle(`${e.broadcasterDisplayName} is now streaming!`)
				.addField('Playing', stream.gameName || '\u200B', true)
				.addField('Started at', stream.startDate.toLocaleString('en-gb'), true)
				await twitchChannel.send({ embeds: [liveEmbed], content: `<@&940666568835207248> ${e.broadcasterDisplayName} has gone live on Twitch!` });
				client.user?.setActivity('Watching', { name: e.broadcasterDisplayName, url: `https://www.twitch.tv/${e.broadcasterDisplayName}` });
		});

		const chatClient = new ChatClient({ authProvider: authProvider, channels: ['thebadgameruk'] });
		await chatClient.connect();
		chatClient.onMessage(this.handleChatMessage.bind(this));
		chatClient.onSub(this.handleSubscription.bind(this));
		chatClient.onResub(this.handleSubscription.bind(this));
	}

	async handleChatMessage(channel: string, user: string, message: string, msg: TwitchPrivateMessage) {
		await twitchChannel.send(`[Chat] ${user}: ${message}`);
	}

	async handleSubscription(channel: string, user: string, subInfo: ChatSubInfo, msg: UserNotice) {
		await twitchChannel.send(`${user} just subscribed to ${channel}! They have now been subbed for ${subInfo.months} whole months!`);
	}
}