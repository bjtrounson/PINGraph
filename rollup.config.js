import typescript from '@rollup/plugin-typescript';
import { terser } from "rollup-plugin-terser";

export default {
    input: 'src/pin-chart.ts',
    output: [
        {
            format: 'umd',
            name: "PINChart",
            sourcemap: true,
            dir: "dist",
            globals: {
                "chart.js": 'Chart',
                "moment": 'moment'
            }
        },
        {
            file: "./dist/pin-chart.min.js",
            format: 'umd',
            name: "PINChart",
            sourcemap: true,
            globals: {
                "chart.js": 'Chart',
                "moment": 'moment'
            },
            plugins: [terser()]
        },
        {
            format: 'esm',
            sourcemap: true,
            dir: "dist/esm",
        },
    ],
    plugins: [
        {
            name: 'replace moment imports',
            transform: code =>
            ({
                code: code.replace(/import\s*\*\s*as\s*moment/g, 'import moment'),
                map: { mappings: '' }
            })
        },
        typescript({target: "es5"}),
    ],    
};