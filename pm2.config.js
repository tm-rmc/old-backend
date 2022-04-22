module.exports = {
    apps : [{
        name: 'TM Random Map Online Services',
        script: 'src/index.js',

        // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
        autorestart: true,
        max_memory_restart: '500M',
        out_file: 'logs/out.log',
        error_file: 'logs/errors.log',
    }]
};