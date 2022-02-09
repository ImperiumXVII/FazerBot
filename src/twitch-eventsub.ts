import { AccessToken, RefreshingAuthProvider } from '@twurple/auth';
import { ChatClient, ChatSubInfo, UserNotice } from '@twurple/chat';
import { TwitchPrivateMessage } from '@twurple/chat/lib/commands/TwitchPrivateMessage';
import { env } from './environment';
import { promises as fs } from 'fs';
import { twitchChannel } from '.';

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

	static AuthProvider = new RefreshingAuthProvider({ 
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

	async init() {
		const chatClient = new ChatClient({ authProvider: TwitchIntegration.AuthProvider, channels: ['Imperium_XVII'] });
		await chatClient.connect();
		chatClient.onMessage(this.handleChatMessage.bind);
		chatClient.onSub(this.handleSubscription.bind);
		chatClient.onResub(this.handleSubscription.bind);
		chatClient.onHost(this.handleHost.bind);
	}

	async handleChatMessage(channel: string, user: string, message: string, msg: TwitchPrivateMessage) {
		await twitchChannel.send(`[${channel} chat] ${user}: ${message}`);
	}

	async handleSubscription(channel: string, user: string, subInfo: ChatSubInfo, msg: UserNotice) {
		await twitchChannel.send(`${user} just subscribed to ${channel}! They have now been subbed for ${subInfo.months} whole months!`);
	}

	async handleHost(channel: string, target: string, viewers?: number) {
		await twitchChannel.send(`${channel} is now live! target: ${target}, viewers: ${viewers}`);
	}
}