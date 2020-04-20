/**
 * This describes the data that is expected by `native_modules.rb`.
 */
export interface NativeModulesConfig {
  project: {
    ios?: {
      sourceDir: string;
    };
  };
  dependencies: {
    [name: string]: {
      root: string;
      platforms: {
        ios?: {
          podspecPath: string;
          /**
           * @see https://www.rubydoc.info/gems/cocoapods-core/Pod/Podfile/DSL#script_phase-instance_method
           *
           * The only difference is that `script` may be omitted in favour of a
           * `path`, relative to the root of the package, whose content will be
           * used.
           */
          scriptPhases?: Array<
            ({script: string} | {path: string}) & {
              name: string;
              shell_path?: string;
              input_files?: string[];
              output_files?: string[];
              input_file_lists?: string[];
              output_file_lists?: string[];
              show_env_vars_in_log?: boolean;
              dependency_file?: string;
              execution_position?: 'before_compile' | 'after_compile' | 'any';
            }
          >;
        };
        android?: {};
      };
    };
  };
}
