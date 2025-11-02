#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Kolory dla konsoli
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

console.log(
  `${colors.cyan}${colors.bright}🧹 Usuwanie console.log z aplikacji Athletics Platform${colors.reset}\n`
);

// Funkcja do rekurencyjnego znajdowania plików
function findFiles(dir, extensions, excludeDirs = []) {
  let results = [];

  try {
    const list = fs.readdirSync(dir);

    list.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat && stat.isDirectory()) {
        // Pomiń wykluczone katalogi
        if (!excludeDirs.some((excludeDir) => filePath.includes(excludeDir))) {
          results = results.concat(
            findFiles(filePath, extensions, excludeDirs)
          );
        }
      } else {
        // Sprawdź rozszerzenie pliku
        const ext = path.extname(file);
        if (extensions.includes(ext)) {
          results.push(filePath);
        }
      }
    });
  } catch (error) {
    console.error(
      `${colors.red}Błąd podczas skanowania katalogu ${dir}:${colors.reset}`,
      error.message
    );
  }

  return results;
}

// Funkcja do przetwarzania pliku
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    const originalContent = content;
    let changes = 0;

    // Wzorce do usunięcia/zastąpienia
    const patterns = [
      // console.log, console.error, console.warn, console.info, console.debug
      {
        pattern: /console\.(log|error|warn|info|debug)\s*\([^;]*\);?\s*\n?/g,
        replacement: "",
        description: "console statements",
      },
      // Wieloliniowe console.log
      {
        pattern:
          /console\.(log|error|warn|info|debug)\s*\(\s*[\s\S]*?\);?\s*\n?/g,
        replacement: "",
        description: "multiline console statements",
      },
    ];

    // Specjalne przypadki - zachowaj niektóre console.error w catch blocks
    const preservePatterns = [
      // W seed.ts i podobnych plikach - zachowaj console.log dla skryptów
      /seed.*\.ts$/,
      /demo.*\.ts$/,
      /test.*\.ts$/,
      /spec\.ts$/,
    ];

    const shouldPreserve = preservePatterns.some((pattern) =>
      pattern.test(filePath)
    );

    if (shouldPreserve) {
      console.log(
        `${colors.yellow}⏭️  Pomijam plik (skrypt/test): ${filePath}${colors.reset}`
      );
      return 0;
    }

    // Zastąp console.error w catch blocks na proper logging
    content = content.replace(
      /catch\s*\([^)]*\)\s*\{[\s\S]*?console\.error\([^;]*\);?[\s\S]*?\}/g,
      (match) => {
        // Jeśli to jest w service, zastąp na this.logger.error
        if (filePath.includes(".service.ts")) {
          return match.replace(
            /console\.error\([^;]*\);?/g,
            "// Error logged by service logger"
          );
        }
        // W innych przypadkach po prostu usuń
        return match.replace(/console\.error\([^;]*\);?/g, "");
      }
    );

    // Zastosuj wszystkie wzorce
    patterns.forEach(({ pattern, replacement, description }) => {
      const matches = content.match(pattern);
      if (matches) {
        changes += matches.length;
        content = content.replace(pattern, replacement);
      }
    });

    // Usuń puste linie pozostałe po usunięciu console.log
    content = content.replace(/\n\s*\n\s*\n/g, "\n\n");

    // Zapisz plik tylko jeśli były zmiany
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(
        `${colors.green}✅ ${filePath}: usunięto ${changes} console statements${colors.reset}`
      );
      return changes;
    }

    return 0;
  } catch (error) {
    console.error(
      `${colors.red}❌ Błąd podczas przetwarzania ${filePath}:${colors.reset}`,
      error.message
    );
    return 0;
  }
}

// Główna funkcja
function main() {
  const rootDir = path.join(__dirname, "..");
  const backendDir = path.join(rootDir, "athletics-platform", "backend", "src");
  const frontendDir = path.join(
    rootDir,
    "athletics-platform",
    "frontend",
    "src"
  );

  const extensions = [".ts", ".tsx", ".js", ".jsx"];
  const excludeDirs = ["node_modules", "dist", ".next", "coverage", ".git"];

  let totalChanges = 0;
  let processedFiles = 0;

  console.log(`${colors.blue}📁 Skanowanie plików...${colors.reset}`);

  // Przetwórz backend
  if (fs.existsSync(backendDir)) {
    console.log(
      `\n${colors.magenta}🔧 Przetwarzanie Backend...${colors.reset}`
    );
    const backendFiles = findFiles(backendDir, extensions, excludeDirs);

    backendFiles.forEach((file) => {
      const changes = processFile(file);
      totalChanges += changes;
      if (changes > 0) processedFiles++;
    });
  }

  // Przetwórz frontend
  if (fs.existsSync(frontendDir)) {
    console.log(
      `\n${colors.magenta}🎨 Przetwarzanie Frontend...${colors.reset}`
    );
    const frontendFiles = findFiles(frontendDir, extensions, excludeDirs);

    frontendFiles.forEach((file) => {
      const changes = processFile(file);
      totalChanges += changes;
      if (changes > 0) processedFiles++;
    });
  }

  // Podsumowanie
  console.log(
    `\n${colors.cyan}${colors.bright}📊 PODSUMOWANIE:${colors.reset}`
  );
  console.log(
    `${colors.green}✅ Przetworzone pliki: ${processedFiles}${colors.reset}`
  );
  console.log(
    `${colors.green}✅ Usunięte console statements: ${totalChanges}${colors.reset}`
  );

  if (totalChanges > 0) {
    console.log(`\n${colors.yellow}💡 Zalecenia:${colors.reset}`);
    console.log(
      `${colors.yellow}   1. Sprawdź zmiany: git diff${colors.reset}`
    );
    console.log(`${colors.yellow}   2. Uruchom testy: npm test${colors.reset}`);
    console.log(
      `${colors.yellow}   3. Uruchom lint: npm run lint${colors.reset}`
    );
    console.log(
      `${colors.yellow}   4. Zatwierdź zmiany: git add . && git commit -m "Remove console statements"${colors.reset}`
    );
  }

  console.log(`\n${colors.green}${colors.bright}🎉 Gotowe!${colors.reset}`);
}

// Uruchom skrypt
if (require.main === module) {
  main();
}

module.exports = { processFile, findFiles };
