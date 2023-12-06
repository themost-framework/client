import { BasicDataContext, BasicDataService } from '@themost/client/common';

export class TestContext extends BasicDataContext {
    constructor() {
        super("http://localhost:8080/api/", {
            useResponseConversion: true
        });
    }
    async authenticate() {
        const service = new BasicDataService("http://localhost:8080/");
        const {access_token} = await service.execute({
            url: "/auth/token",
            method: "POST",
            data: {
                grant_type: "password",
                client_id: "9165351833584149",
                client_secret: "hTgqFBUhCfHs/quf/wnoB+UpDSfUusKA",
                username: "alexis.rees@example.com",
                password: "secret",
                scope: "profile"
            },
            headers: {
              "Content-Type": "application/json",
            },
        })
        this.setBearerAuthorization(access_token);
    }
}
