import { Organization } from './organization.model';

export type CreateOrganization = Omit<Organization, 'id'>;
