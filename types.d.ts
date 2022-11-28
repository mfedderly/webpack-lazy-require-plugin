declare module "webpack-lazy-require-plugin" {
    class LazyRequirePlugin {
        apply(compiler: any): void;
    }

    export = LazyRequirePlugin;
} 