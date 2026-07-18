import { Organization } from './organization.model';

export type GetOrganization = Organization & {
  logoUrl: string;
};
