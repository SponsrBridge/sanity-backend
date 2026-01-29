import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemas';

export default defineConfig({
  name: 'sponsrbridge-blog',
  title: 'SponsrBridge Blog',

  // TODO: Replace with your actual Sanity project ID and dataset
  // Create a project at https://www.sanity.io/manage
  projectId: 'rt9k03al',
  dataset: 'production',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
});
