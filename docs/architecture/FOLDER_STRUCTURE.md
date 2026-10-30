# Actual folder structure

```text
Recall/
  apps/
    api/src/{app,config,errors,middleware,routes,services}/
    desktop/src/{main,preload}/
    web/{public,src/{app/layouts,app/providers,components/navigation,components/ui,features/dashboard,features/settings,lib,styles}}
  database/{adapters,migrations}/
  packages/{contracts,domain}/src/
  scripts/
  storage/local/
  tests/{desktop,e2e,integration,native,unit}/
  docs/{architecture,database,api,desktop,deployment,testing}/
  data/.gitkeep
```

This foundation creates only packages with actual work. It does not add empty `shared-types`, `validation`, `config`, `runtime-contracts`, `services/ai`, `seeds`, or generic placeholder modules. Shared Zod/type contracts live in `packages/contracts`; persistence ports live in `packages/domain`; runtime-boundary implementations are in the web runtime and Electron preload.

Build artifacts (`apps/web/dist`, `apps/api/dist`, `apps/desktop/dist`, and `release`) are generated and ignored; `apps/web/index.html` is generated from the checked-in `index.template` by `scripts/build.mjs`.
