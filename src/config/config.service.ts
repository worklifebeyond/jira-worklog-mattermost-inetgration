import * as dotenv from 'dotenv';
import { DatabaseObject } from './config.object';

enum Environments {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

export class ConfigService {

  databaseConfig: DatabaseObject;
  environment: Environments;

  constructor() {
    const ENVIRONMENTS = process.env;
    if (ENVIRONMENTS.NODE_ENV !== 'production') {
      dotenv.config();
      this.environment = Environments.PRODUCTION;
      this.databaseConfig = {
        jiraHost: ENVIRONMENTS.JIRA_HOST,
        jiraUser: ENVIRONMENTS.JIRA_USER,
        jiraPass: ENVIRONMENTS.JIRA_PASS,
      };
    } else {
      this.environment = Environments.DEVELOPMENT;
      this.databaseConfig = {
        jiraHost: ENVIRONMENTS.JIRA_HOST,
        jiraUser: ENVIRONMENTS.JIRA_USER,
        jiraPass: ENVIRONMENTS.JIRA_PASS,
      };
    }

  }

  getDbConfig(): DatabaseObject {
    return this.databaseConfig;
  }

  getEnvironment(): string {
    return this.environment;
  }
}
