import { BigQuery } from "@google-cloud/bigquery";

let bigQueryClient: BigQuery | null = null;

const getGCPCredentials = () => {
  return process.env.GCP_PRIVATE_KEY
    ? {
        credentials: {
          client_email: process.env.GCP_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GCP_PRIVATE_KEY,
        },
        projectId: process.env.GCP_PROJECT_ID,
      }
    : {
        projectId: process.env.GCP_PROJECT_ID,
      };
};

if (!bigQueryClient) bigQueryClient = new BigQuery(getGCPCredentials());

export const getBigQueryClient = () => bigQueryClient as BigQuery;
