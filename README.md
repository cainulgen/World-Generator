--- a/README.md
+++ b/README.md
@@ -23,6 +23,17 @@
    - Make it easy to add new features without major refactoring
    - Keep interfaces between modules clean and well-defined
 
+5. **Global Settings Rule (Crucial)**
+   - Parameters within the "Global Settings" section (e.g., Mesh Detail, Texture Detail) are **strictly for performance and rendering quality**.
+   - They **must never alter the fundamental shape, scale, or characteristics of the generated terrain**.
+   - For instance, changing "Mesh Detail" should only subdivide the existing terrain features more finely, not change the size or placement of hills and valleys.
+   - Any changes to the underlying world data (like noise patterns, landmass shapes, etc.) belong in their respective generation modules (e.g., "Noise & Distortion," "Base Shape") and not in Global Settings.
+
+6. **Data Layering Principle**
+   - Conceptually, the world starts as a flat plane. Perlin noise (and future generation modules) apply as layers on top of this base.
+   - Each generation module contributes to the final shape or appearance, with global settings solely controlling the fidelity of its representation.
+
+
 5. **UI/UX Standards**
    - Use the system font stack for all text: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
    - Maintain consistent styling across all UI components