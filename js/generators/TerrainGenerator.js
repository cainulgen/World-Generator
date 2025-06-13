import * as THREE from 'three';

export class TerrainGenerator {
    constructor(scene, worldSize = 2000) {
        this.scene = scene;
        this.worldSize = worldSize;
        this.terrainMesh = null;
        this.gridHelper = null;
    }

    generate(meshDetail) {
        if (this.terrainMesh) {
            this.scene.remove(this.terrainMesh);
            this.terrainMesh.geometry.dispose();
            this.terrainMesh.material.dispose();
        }
        const geometry = new THREE.PlaneGeometry(this.worldSize, this.worldSize, meshDetail - 1, meshDetail - 1);
        geometry.rotateX(-Math.PI / 2);
        const vertices = geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const randomHeight = (Math.random() - 0.5) * 250;
            const ruggedness = Math.random() * 80;
            vertices[i + 1] = randomHeight + ruggedness * Math.sin(vertices[i] / 200) * Math.cos(vertices[i + 2] / 200);
        }
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
        const material = new THREE.MeshStandardMaterial({ color: 0x556B2F, roughness: 0.8, metalness: 0.2 });
        this.terrainMesh = new THREE.Mesh(geometry, material);
        this.terrainMesh.receiveShadow = true;
        this.scene.add(this.terrainMesh);
    }

    updateGrid(size, visible) {
        if (this.gridHelper) {
            this.scene.remove(this.gridHelper);
            this.gridHelper.geometry.dispose();
            this.gridHelper.material.dispose();
        }
        this.gridHelper = new THREE.GridHelper(this.worldSize, size, 0xffffff, 0xffffff);
        this.gridHelper.material.opacity = 0.2;
        this.gridHelper.material.transparent = true;
        this.gridHelper.position.y = 0.1;
        this.gridHelper.visible = visible;
        this.scene.add(this.gridHelper);
    }
}
