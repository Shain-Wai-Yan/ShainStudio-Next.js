# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{pkgs}: let
  # Pin the security release: the workspace channel's Node package can lag.
  # SHA-256: https://nodejs.org/dist/v24.22.1/SHASUMS256.txt
  # Firebase Studio runs on x86_64 Linux; autoPatchelf supplies Nix library paths.
  node24 = pkgs.stdenv.mkDerivation {
    pname = "nodejs";
    version = "24.22.1";
    src = pkgs.fetchurl {
      url = "https://nodejs.org/dist/v24.22.1/node-v24.22.1-linux-x64.tar.xz";
      sha256 = "6c172a9ab6718f7b801fb5a7bd486af2ee5e32758086a04b84fcce2aa77095e6";
    };
    nativeBuildInputs = [pkgs.autoPatchelfHook];
    buildInputs = [pkgs.stdenv.cc.cc.lib];
    dontBuild = true;
    installPhase = ''
      runHook preInstall
      mkdir -p "$out"
      cp -r . "$out/"
      runHook postInstall
    '';
    postFixup = ''
      "$out/bin/node" -e 'if (process.version !== "v24.22.1") process.exit(1)'
      PATH="$out/bin:$PATH" "$out/bin/npm" --version
    '';
    meta.platforms = ["x86_64-linux"];
  };
in {
  # Which nixpkgs channel to use.
  channel = "stable-24.05"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    node24
  ];
  # Sets environment variables in the workspace
  env = {};
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      # "vscodevim.vim"
      "google.gemini-cli-vscode-ide-companion"
    ];
    workspace = {
      # Runs when a workspace is first created with this `dev.nix` file
      onCreate = {
        npm-install = "npm ci --ignore-scripts --no-audit --prefer-offline --no-progress";
        # Open editors for the following files by default, if they exist:
        default.openFiles = [
          # Cover all the variations of language, src-dir, router (app/pages)
          "pages/index.tsx" "pages/index.js"
          "src/pages/index.tsx" "src/pages/index.js"
          "app/page.tsx" "app/page.js"
          "src/app/page.tsx" "src/app/page.js"
        ];
      };
      # To run something each time the workspace is (re)started, use the `onStart` hook
    };
    # Enable previews and customize configuration
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT" "--hostname" "0.0.0.0"];
          manager = "web";
        };
      };
    };
  };
}
