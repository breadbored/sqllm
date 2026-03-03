import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  external: ["react", "react-dom", "lucide-react"],
  sourcemap: false,
  splitting: false,
  treeshake: true,
  outDir: "dist",
  publicDir: "styles",
});
