import { MunicipalitySchema } from './types';

export const SCHEMAS: MunicipalitySchema[] = [
  {
    municipality: 'Cumberland',
    sections: [
      {
        id: 'org',
        title: 'Organization Info',
        initiallyOpen: true,
        fields: [
          { id: 'org_name', label: 'Company / Organization Name', kind: 'text', required: true, placeholder: 'GreenBuild LLC' },
          { id: 'org_phone', label: 'Phone', kind: 'text', placeholder: '(555) 123-4567' },
          { id: 'org_email', label: 'Email', kind: 'text', placeholder: 'info@company.com' },
        ],
      },
      {
        id: 'customer',
        title: 'Customer Info',
        fields: [
          { id: 'cust_name', label: 'Customer Name', kind: 'text', required: true },
          { id: 'cust_email', label: 'Customer Email', kind: 'text' },
          { id: 'cust_address', label: 'Project Address', kind: 'text' },
        ],
      },
      {
        id: 'project',
        title: 'Project Details',
        fields: [
          { id: 'project_type', label: 'Project Type', kind: 'select', options: [
            { label: 'EV Charger', value: 'ev' },
            { label: 'Solar + Deck', value: 'solar_deck' },
            { label: 'Renovation', value: 'reno' },
          ], required: true },
          { id: 'notes', label: 'Notes', kind: 'textarea', placeholder: 'Anything important…' },
          { id: 'ev_checkbox', label: 'Include utility coordination', kind: 'checkbox' },
        ],
      },
      {
        id: 'town_reqs',
        title: 'Town Requirements',
        fields: [
          { id: 'zoning_district', label: 'Zoning District', kind: 'text' },
          { id: 'required_inspections', label: 'Required Inspections', kind: 'multiselect', options: [
            { label: 'Rough Electrical', value: 'rough_elec' },
            { label: 'Final Electrical', value: 'final_elec' },
            { label: 'Building Final', value: 'building_final' },
          ]},
        ],
      },
      {
        id: 'other_files',
        title: 'Other Required Files',
        fields: [
          { id: 'site_plan', label: 'Site Plan Provided', kind: 'checkbox' },
          { id: 'uploaded_summary', label: 'Upload Summary', kind: 'textarea', placeholder: 'What was uploaded / parsed…' },
        ],
      },
    ],
  },
  {
    municipality: 'Springfield',
    sections: [
      {
        id: 'org',
        title: 'Organization Info',
        initiallyOpen: true,
        fields: [
          { id: 'org_name', label: 'Company Name', kind: 'text', required: true },
          { id: 'org_email', label: 'Email', kind: 'text' },
        ],
      },
      {
        id: 'project',
        title: 'Project Details',
        fields: [
          { id: 'project_type', label: 'Project Type', kind: 'select', options: [
            { label: 'ADU', value: 'adu' },
            { label: 'Deck', value: 'deck' },
            { label: 'EV Charger', value: 'ev' },
          ]},
          { id: 'materials', label: 'Materials', kind: 'textarea' },
        ],
      },
      {
        id: 'town_reqs',
        title: 'Town Requirements',
        fields: [
          { id: 'permit_route', label: 'Permit Route', kind: 'select', options: [
            { label: 'Online', value: 'online' },
            { label: 'In-Person', value: 'in_person' },
          ]},
        ],
      },
    ],
  },
];

export function getMunicipalities(): string[] {
  return SCHEMAS.map(s => s.municipality);
}

export function getSchemaForMunicipality(m: string): MunicipalitySchema {
  return SCHEMAS.find(s => s.municipality === m) ?? SCHEMAS[0];
}
