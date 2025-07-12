/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// This file is added to resolve a PostCSS error during the build process.
// The project does not use Tailwind CSS, so we provide a minimal
// PostCSS configuration to prevent the build from failing while
// trying to load a non-existent 'tailwindcss' plugin.
export default {
  plugins: [],
};
