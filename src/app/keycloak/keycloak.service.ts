import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";

declare let Keycloak: any;

@Injectable()
export class KeycloakService {
	static auth: any = {};

	static init(): Promise<any> {
		const keycloakAuth: any = Keycloak({
			url: environment.keycloakRootUrl,
			realm: 'master',
			clientId: 'frontend',
			'ssl-required': 'external',
			'resource': 'frontend',
			'public-client': true,
			'confidential-port': 0
		});

		KeycloakService.auth.loggedIn = false;

		return new Promise((resolve, reject) => {
			keycloakAuth.init({onLoad: 'login-required'})
				.success(() => {
					console.log(keycloakAuth);
					KeycloakService.auth.loggedIn = true;
					KeycloakService.auth.authz = keycloakAuth;
					KeycloakService.auth.logoutUrl = keycloakAuth.authServerUrl
						+ '/realms/angular_keycloak/protocol/openid-connect/logout?redirect_uri='
						+ document.baseURI;
					resolve();
				})
				.error(() => {
					reject();
				});
		});
	}

	static logout() {
		console.log('**  LOGOUT');
		KeycloakService.auth.loggedIn = false;
		KeycloakService.auth.authz = null;

		window.location.href = KeycloakService.auth.logoutUrl;
	}

	static getUsername(): string {
		return KeycloakService.auth.authz.tokenParsed.preferred_username;
	}

	static getFullName(): string {
		return KeycloakService.auth.authz.tokenParsed.name;
	}

	getToken(): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			if (KeycloakService.auth.authz.token) {
				KeycloakService.auth.authz
					.updateToken(5)
					.success(() => {
						resolve(<string>KeycloakService.auth.authz.token);
					})
					.error(() => {
						reject('Failed to refresh token');
					});
			} else {
				reject('Not logged in');
			}
		});
	}
}
