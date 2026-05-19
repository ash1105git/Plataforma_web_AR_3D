const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sourceDir = path.join(__dirname, 'assets', 'modelos_comprimidos');
const backupDir = path.join(__dirname, 'assets', 'modelos_originales');

// 1. Crear carpeta de respaldo si no existe
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log('✅ Carpeta de respaldo creada:', backupDir);
}

const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.glb'));

console.log(`⏳ Encontrados ${files.length} modelos. Iniciando compresión Draco...`);

files.forEach(file => {
    const originalPath = path.join(sourceDir, file);
    const backupPath = path.join(backupDir, file);

    // 2. Hacer copia de seguridad si no existe
    if (!fs.existsSync(backupPath)) {
        fs.copyFileSync(originalPath, backupPath);
        console.log(`📦 Respaldo guardado: ${file}`);
    } else {
        console.log(`📦 Respaldo ya existe para: ${file}`);
    }

    const statOriginal = fs.statSync(backupPath);
    const originalSizeMB = (statOriginal.size / (1024 * 1024)).toFixed(2);

    console.log(`\n⚙️ Comprimiendo ${file} (${originalSizeMB} MB)...`);
    
    // 3. Comprimir usando gltf-pipeline
    // Usamos el archivo de backup como entrada y sobreescribimos el archivo en modelos_comprimidos
    const command = `npx.cmd gltf-pipeline -i "${backupPath}" -o "${originalPath}" -d`;
    
    try {
        execSync(command, { stdio: 'inherit' });
        
        const statNew = fs.statSync(originalPath);
        const newSizeMB = (statNew.size / (1024 * 1024)).toFixed(2);
        const reduction = ((1 - statNew.size / statOriginal.size) * 100).toFixed(1);
        
        console.log(`✅ ¡Completado! Nuevo tamaño: ${newSizeMB} MB (Reducción del ${reduction}%)`);
    } catch (err) {
        console.error(`❌ Error al comprimir ${file}:`, err.message);
    }
});

console.log('\n🎉 ¡Proceso de optimización finalizado!');
