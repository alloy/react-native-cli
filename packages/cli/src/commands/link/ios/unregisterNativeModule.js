/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import xcode from 'xcode';
import path from 'path';
import fs from 'fs';
import {difference, isEmpty} from 'lodash';

import getGroup from './getGroup';
import getTargets from './getTargets';
import getHeadersInFolder from './getHeadersInFolder';
import getHeaderSearchPath from './getHeaderSearchPath';
import removeProjectFromProject from './removeProjectFromProject';
import removeProjectFromLibraries from './removeProjectFromLibraries';
import removeFromStaticLibraries from './removeFromStaticLibraries';
import removeFromHeaderSearchPaths from './removeFromHeaderSearchPaths';
import removeSharedLibraries from './removeSharedLibraries';
import logger from '../../../tools/logger';

/**
 * Unregister native module IOS
 *
 * If library is already unlinked, this action is a no-op.
 */
export default function unregisterNativeModule(
  dependencyConfig,
  projectConfig,
  iOSDependencies,
) {
  logger.debug(`Reading ${projectConfig.pbxprojPath}`);
  const project = xcode.project(projectConfig.pbxprojPath).parseSync();
  const dependencyProject = xcode
    .project(dependencyConfig.pbxprojPath)
    .parseSync();

  const libraries = getGroup(project, projectConfig.libraryFolder);

  const file = removeProjectFromProject(
    project,
    path.relative(projectConfig.sourceDir, dependencyConfig.projectPath),
  );

  removeProjectFromLibraries(libraries, file);

  getTargets(dependencyProject).forEach(target => {
    logger.debug(
      `Removing ${target.name} from ${
        project.getFirstTarget().firstTarget.name
      }`,
    );
    removeFromStaticLibraries(project, target.name, {
      target: project.getFirstTarget().uuid,
    });
  });

  const sharedLibraries = difference(
    dependencyConfig.sharedLibraries,
    iOSDependencies.reduce(
      (libs, dependency) => libs.concat(dependency.sharedLibraries),
      projectConfig.sharedLibraries,
    ),
  );

  removeSharedLibraries(project, sharedLibraries);

  const headers = getHeadersInFolder(dependencyConfig.folder);
  if (!isEmpty(headers)) {
    removeFromHeaderSearchPaths(
      project,
      getHeaderSearchPath(projectConfig.sourceDir, headers),
    );
  }

  logger.debug(`Writing changes to ${projectConfig.pbxprojPath}`);
  fs.writeFileSync(projectConfig.pbxprojPath, project.writeSync());
}
