(function () {
    function errorLog(msg) {
        process.stdout.write(`ERROR: ${msg}\n`);
    }

    function infoLog(msg) {
        process.stdout.write(`INFO: ${msg}\n`);
    }

    function exportModel() {
        if (app.commandLine.hasSwitch("cli-model-path")) {
            hasExportedSomething = true;

            let exportModelPath = app.commandLine.getSwitchValue("cli-model-path");
            let exportModelCodec = app.commandLine.getSwitchValue("cli-model-codec");
            if (!exportModelCodec || !Codecs[exportModelCodec]) {
                errorLog(`"${exportModelCodec}" is an invalid model codec, available codecs: ${Object.keys(Codecs)}`);
                return true;
            }

            infoLog(`Exporting model with "${exportModelCodec}" codec to "${exportModelPath}"...`);
            Blockbench.writeFile(
                exportModelPath,
                {
                    content: Codecs[exportModelCodec].compile()
                },
                cb => infoLog(`Model exported!`)
            );
            return true;
        }
        return false;
    }

    function exportTexture() {
        if (app.commandLine.hasSwitch("cli-texture-path")) {
            let texturePath = app.commandLine.getSwitchValue("cli-texture-path");
            if (Texture.all.length == 0) {
                errorLog("There isn't a texture in this model.");
                return true;
            }
            if (Texture.all.length > 1) {
                errorLog("More than one texture is not supported right now.");
                return true;
            }

            infoLog(`Exporting the texture to "${texturePath}"...`);
            Blockbench.writeFile(
                texturePath,
                {
                    content: Buffer.from(Texture.all[0].getBase64(), "base64"),
                    savetype: 'blob'
                },
                cb => infoLog("Texture exported!")
            );
        }
        return false;
    }

    function exportAnimations() {
        if (app.commandLine.hasSwitch("cli-animation-path")) {
            let texturePath = app.commandLine.getSwitchValue("cli-animation-path");
            if (Animation.all.length == 0) {
                errorLog("There isn't any animation in this model.");
                return true;
            }
            Blockbench.writeFile(
                texturePath,
                {
                    content: compileJSON(Animator.buildFile())
                },
                cb => infoLog("Animation exported!")
            );
            return true;
        }
        return false;
    }

    Plugin.register('blockbench_cli', {
        title: 'Blockbench CLI',
        author: 'xQuickGlare',
        description: '(WIP) A small addon that adds some CLI options to Blockbench',
        icon: 'file_download',
        version: '0.0.1',
        variant: 'both',
        onload() {
            Codecs.project.on('parsed', data => {
                let hasExportedSomething = false;
                hasExportedSomething |= exportModel();
                hasExportedSomething |= exportTexture();
                hasExportedSomething |= exportAnimations();

                if (hasExportedSomething) {
                    app.exit();
                }
            });
        }
    });
})();