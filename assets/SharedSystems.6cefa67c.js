import { a5 as State, ax as TextureMatrix, R as Matrix, ay as Batcher, az as BatchGeometry, K as ExtensionType, Y as Bounds, a6 as BigPool, aA as getGlobalBounds, aB as FilterEffect, aC as Sprite, X as Texture, ar as STENCIL_MODES, au as CLEAR, N as warn, aD as unsafeEvalSupported, at as Buffer, as as BufferUsage, av as CanvasSource, an as uid, ao as TextureSource, ah as Rectangle, aE as SystemRunner, M as EventEmitter, Q as Container, aF as UPDATE_COLOR, aG as UPDATE_BLEND, aH as UPDATE_VISIBLE, a1 as Color, O as extensions, aI as getLocalBounds, P as Point, W as BindGroup, af as DOMAdapter, $ as deprecation, a0 as v8_0_0, aJ as RendererInitHook } from './index.ab82c011.js';
import { S as Shader, G as GpuProgram, m as GlProgram, U as UniformGroup, T as TexturePool, R as RendererType, n as getAttributeInfoFromFormat, B as BatchableSprite, c as color32BitToUniform } from './colorToUniform.61d96af7.js';

const _Filter = class _Filter extends Shader {
  /**
   * @param options - The optional parameters of this filter.
   */
  constructor(options) {
    options = { ..._Filter.defaultOptions, ...options };
    super(options);
    /** If enabled is true the filter is applied, if false it will not. */
    this.enabled = true;
    /**
     * The gpu state the filter requires to render.
     * @internal
     * @ignore
     */
    this._state = State.for2d();
    this.blendMode = options.blendMode;
    this.padding = options.padding;
    if (typeof options.antialias === "boolean") {
      this.antialias = options.antialias ? "on" : "off";
    } else {
      this.antialias = options.antialias;
    }
    this.resolution = options.resolution;
    this.blendRequired = options.blendRequired;
    this.addResource("uTexture", 0, 1);
  }
  /**
   * Applies the filter
   * @param filterManager - The renderer to retrieve the filter from
   * @param input - The input render target.
   * @param output - The target to output to.
   * @param clearMode - Should the output be cleared before rendering to it
   */
  apply(filterManager, input, output, clearMode) {
    filterManager.applyFilter(this, input, output, clearMode);
  }
  /**
   * Get the blend mode of the filter.
   * @default "normal"
   */
  get blendMode() {
    return this._state.blendMode;
  }
  /** Sets the blend mode of the filter. */
  set blendMode(value) {
    this._state.blendMode = value;
  }
  /**
   * A short hand function to create a filter based of a vertex and fragment shader src.
   * @param options
   * @returns A shiny new PixiJS filter!
   */
  static from(options) {
    const { gpu, gl, ...rest } = options;
    let gpuProgram;
    let glProgram;
    if (gpu) {
      gpuProgram = GpuProgram.from(gpu);
    }
    if (gl) {
      glProgram = GlProgram.from(gl);
    }
    return new _Filter({
      gpuProgram,
      glProgram,
      ...rest
    });
  }
};
/**
 * The default filter settings
 * @static
 */
_Filter.defaultOptions = {
  blendMode: "normal",
  resolution: 1,
  padding: 0,
  antialias: "off",
  blendRequired: false
};
let Filter = _Filter;

var fragment = "in vec2 vMaskCoord;\nin vec2 vTextureCoord;\n\nuniform sampler2D uTexture;\nuniform sampler2D uMaskTexture;\n\nuniform float uAlpha;\nuniform vec4 uMaskClamp;\n\nout vec4 finalColor;\n\nvoid main(void)\n{\n    float clip = step(3.5,\n        step(uMaskClamp.x, vMaskCoord.x) +\n        step(uMaskClamp.y, vMaskCoord.y) +\n        step(vMaskCoord.x, uMaskClamp.z) +\n        step(vMaskCoord.y, uMaskClamp.w));\n\n    // TODO look into why this is needed\n    float npmAlpha = uAlpha; \n    vec4 original = texture(uTexture, vTextureCoord);\n    vec4 masky = texture(uMaskTexture, vMaskCoord);\n    float alphaMul = 1.0 - npmAlpha * (1.0 - masky.a);\n\n    original *= (alphaMul * masky.r * uAlpha * clip);\n\n    finalColor = original;\n}\n";

var vertex = "in vec2 aPosition;\n\nout vec2 vTextureCoord;\nout vec2 vMaskCoord;\n\n\nuniform vec4 uInputSize;\nuniform vec4 uOutputFrame;\nuniform vec4 uOutputTexture;\nuniform mat3 uFilterMatrix;\n\nvec4 filterVertexPosition(  vec2 aPosition )\n{\n    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;\n       \n    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;\n    position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;\n\n    return vec4(position, 0.0, 1.0);\n}\n\nvec2 filterTextureCoord(  vec2 aPosition )\n{\n    return aPosition * (uOutputFrame.zw * uInputSize.zw);\n}\n\nvec2 getFilterCoord( vec2 aPosition )\n{\n    return  ( uFilterMatrix * vec3( filterTextureCoord(aPosition), 1.0)  ).xy;\n}   \n\nvoid main(void)\n{\n    gl_Position = filterVertexPosition(aPosition);\n    vTextureCoord = filterTextureCoord(aPosition);\n    vMaskCoord = getFilterCoord(aPosition);\n}\n";

var source = "struct GlobalFilterUniforms {\n  uInputSize:vec4<f32>,\n  uInputPixel:vec4<f32>,\n  uInputClamp:vec4<f32>,\n  uOutputFrame:vec4<f32>,\n  uGlobalFrame:vec4<f32>,\n  uOutputTexture:vec4<f32>,  \n};\n\nstruct MaskUniforms {\n  uFilterMatrix:mat3x3<f32>,\n  uMaskClamp:vec4<f32>,\n  uAlpha:f32,\n};\n\n\n@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;\n@group(0) @binding(1) var uTexture: texture_2d<f32>;\n@group(0) @binding(2) var uSampler : sampler;\n\n@group(1) @binding(0) var<uniform> filterUniforms : MaskUniforms;\n@group(1) @binding(1) var uMaskTexture: texture_2d<f32>;\n\nstruct VSOutput {\n    @builtin(position) position: vec4<f32>,\n    @location(0) uv : vec2<f32>,\n    @location(1) filterUv : vec2<f32>,\n  };\n\nfn filterVertexPosition(aPosition:vec2<f32>) -> vec4<f32>\n{\n    var position = aPosition * gfu.uOutputFrame.zw + gfu.uOutputFrame.xy;\n\n    position.x = position.x * (2.0 / gfu.uOutputTexture.x) - 1.0;\n    position.y = position.y * (2.0*gfu.uOutputTexture.z / gfu.uOutputTexture.y) - gfu.uOutputTexture.z;\n\n    return vec4(position, 0.0, 1.0);\n}\n\nfn filterTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>\n{\n    return aPosition * (gfu.uOutputFrame.zw * gfu.uInputSize.zw);\n}\n\nfn globalTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>\n{\n  return  (aPosition.xy / gfu.uGlobalFrame.zw) + (gfu.uGlobalFrame.xy / gfu.uGlobalFrame.zw);  \n}\n\nfn getFilterCoord(aPosition:vec2<f32> ) -> vec2<f32>\n{\n  return ( filterUniforms.uFilterMatrix * vec3( filterTextureCoord(aPosition), 1.0)  ).xy;\n}\n\nfn getSize() -> vec2<f32>\n{\n\n  \n  return gfu.uGlobalFrame.zw;\n}\n  \n@vertex\nfn mainVertex(\n  @location(0) aPosition : vec2<f32>, \n) -> VSOutput {\n  return VSOutput(\n   filterVertexPosition(aPosition),\n   filterTextureCoord(aPosition),\n   getFilterCoord(aPosition)\n  );\n}\n\n@fragment\nfn mainFragment(\n  @location(0) uv: vec2<f32>,\n  @location(1) filterUv: vec2<f32>,\n  @builtin(position) position: vec4<f32>\n) -> @location(0) vec4<f32> {\n\n    var maskClamp = filterUniforms.uMaskClamp;\n\n     var clip = step(3.5,\n        step(maskClamp.x, filterUv.x) +\n        step(maskClamp.y, filterUv.y) +\n        step(filterUv.x, maskClamp.z) +\n        step(filterUv.y, maskClamp.w));\n\n    var mask = textureSample(uMaskTexture, uSampler, filterUv);\n    var source = textureSample(uTexture, uSampler, uv);\n    \n    var npmAlpha = 0.0;\n\n    var alphaMul = 1.0 - npmAlpha * (1.0 - mask.a);\n\n    var a = (alphaMul * mask.r) * clip;\n\n    return vec4(source.rgb, source.a) * a;\n}";

class MaskFilter extends Filter {
  constructor(options) {
    const { sprite, ...rest } = options;
    const textureMatrix = new TextureMatrix(sprite.texture);
    const filterUniforms = new UniformGroup({
      uFilterMatrix: { value: new Matrix(), type: "mat3x3<f32>" },
      uMaskClamp: { value: textureMatrix.uClampFrame, type: "vec4<f32>" },
      uAlpha: { value: 1, type: "f32" }
    });
    const gpuProgram = GpuProgram.from({
      vertex: {
        source,
        entryPoint: "mainVertex"
      },
      fragment: {
        source,
        entryPoint: "mainFragment"
      }
    });
    const glProgram = GlProgram.from({
      vertex,
      fragment,
      name: "mask-filter"
    });
    super({
      ...rest,
      gpuProgram,
      glProgram,
      resources: {
        filterUniforms,
        uMaskTexture: sprite.texture.source
      }
    });
    this.sprite = sprite;
    this._textureMatrix = textureMatrix;
  }
  apply(filterManager, input, output, clearMode) {
    this._textureMatrix.texture = this.sprite.texture;
    filterManager.calculateSpriteMatrix(
      this.resources.filterUniforms.uniforms.uFilterMatrix,
      this.sprite
    ).prepend(this._textureMatrix.mapCoord);
    this.resources.uMaskTexture = this.sprite.texture.source;
    filterManager.applyFilter(this, input, output, clearMode);
  }
}

class BatcherPipe {
  constructor(renderer, adaptor) {
    this.state = State.for2d();
    this._batches = /* @__PURE__ */ Object.create(null);
    this._geometries = /* @__PURE__ */ Object.create(null);
    this.renderer = renderer;
    this._adaptor = adaptor;
    this._adaptor.init(this);
  }
  buildStart(instructionSet) {
    if (!this._batches[instructionSet.uid]) {
      const batcher = new Batcher();
      this._batches[instructionSet.uid] = batcher;
      this._geometries[batcher.uid] = new BatchGeometry();
    }
    this._activeBatch = this._batches[instructionSet.uid];
    this._activeGeometry = this._geometries[this._activeBatch.uid];
    this._activeBatch.begin();
  }
  addToBatch(batchableObject) {
    this._activeBatch.add(batchableObject);
  }
  break(instructionSet) {
    this._activeBatch.break(instructionSet);
  }
  buildEnd(instructionSet) {
    const activeBatch = this._activeBatch;
    const geometry = this._activeGeometry;
    activeBatch.finish(instructionSet);
    geometry.indexBuffer.setDataWithSize(activeBatch.indexBuffer, activeBatch.indexSize, true);
    geometry.buffers[0].setDataWithSize(activeBatch.attributeBuffer.float32View, activeBatch.attributeSize, false);
  }
  upload(instructionSet) {
    const batcher = this._batches[instructionSet.uid];
    const geometry = this._geometries[batcher.uid];
    if (batcher.dirty) {
      batcher.dirty = false;
      geometry.buffers[0].update(batcher.attributeSize * 4);
    }
  }
  execute(batch) {
    if (batch.action === "startBatch") {
      const batcher = batch.batcher;
      const geometry = this._geometries[batcher.uid];
      this._adaptor.start(this, geometry);
    }
    this._adaptor.execute(this, batch);
  }
  destroy() {
    this.state = null;
    this.renderer = null;
    this._adaptor.destroy();
    this._adaptor = null;
    for (const i in this._batches) {
      this._batches[i].destroy();
    }
    this._batches = null;
    for (const i in this._geometries) {
      this._geometries[i].destroy();
    }
    this._geometries = null;
  }
}
/** @ignore */
BatcherPipe.extension = {
  type: [
    ExtensionType.WebGLPipes,
    ExtensionType.WebGPUPipes,
    ExtensionType.CanvasPipes
  ],
  name: "batch"
};

const textureBit = {
  name: "texture-bit",
  vertex: {
    header: (
      /* wgsl */
      `

        struct TextureUniforms {
            uTextureMatrix:mat3x3<f32>,
        }

        @group(2) @binding(2) var<uniform> textureUniforms : TextureUniforms;
        `
    ),
    main: (
      /* wgsl */
      `
            uv = (textureUniforms.uTextureMatrix * vec3(uv, 1.0)).xy;
        `
    )
  },
  fragment: {
    header: (
      /* wgsl */
      `
            @group(2) @binding(0) var uTexture: texture_2d<f32>;
            @group(2) @binding(1) var uSampler: sampler;

         
        `
    ),
    main: (
      /* wgsl */
      `
            outColor = textureSample(uTexture, uSampler, vUV);
        `
    )
  }
};
const textureBitGl = {
  name: "texture-bit",
  vertex: {
    header: (
      /* glsl */
      `
            uniform mat3 uTextureMatrix;
        `
    ),
    main: (
      /* glsl */
      `
            uv = (uTextureMatrix * vec3(uv, 1.0)).xy;
        `
    )
  },
  fragment: {
    header: (
      /* glsl */
      `
        uniform sampler2D uTexture;

         
        `
    ),
    main: (
      /* glsl */
      `
            outColor = texture(uTexture, vUV);
        `
    )
  }
};

function buildInstructions(renderGroup, renderPipes) {
  const root = renderGroup.root;
  const instructionSet = renderGroup.instructionSet;
  instructionSet.reset();
  renderPipes.batch.buildStart(instructionSet);
  renderPipes.blendMode.buildStart();
  renderPipes.colorMask.buildStart();
  if (root.sortableChildren) {
    root.sortChildren();
  }
  collectAllRenderablesAdvanced(root, instructionSet, renderPipes, true);
  renderPipes.batch.buildEnd(instructionSet);
  renderPipes.blendMode.buildEnd(instructionSet);
}
function collectAllRenderables(container, instructionSet, rendererPipes) {
  if (container.globalDisplayStatus < 7 || !container.includeInBuild)
    return;
  if (container.sortableChildren) {
    container.sortChildren();
  }
  if (container.isSimple) {
    collectAllRenderablesSimple(container, instructionSet, rendererPipes);
  } else {
    collectAllRenderablesAdvanced(container, instructionSet, rendererPipes, false);
  }
}
function collectAllRenderablesSimple(container, instructionSet, renderPipes) {
  if (container.renderPipeId) {
    renderPipes.blendMode.setBlendMode(container, container.groupBlendMode, instructionSet);
    container.didViewUpdate = false;
    const rp = renderPipes;
    rp[container.renderPipeId].addRenderable(container, instructionSet);
  }
  if (!container.renderGroup) {
    const children = container.children;
    const length = children.length;
    for (let i = 0; i < length; i++) {
      collectAllRenderables(children[i], instructionSet, renderPipes);
    }
  }
}
function collectAllRenderablesAdvanced(container, instructionSet, renderPipes, isRoot) {
  if (!isRoot && container.renderGroup) {
    renderPipes.renderGroup.addRenderGroup(container.renderGroup, instructionSet);
  } else {
    for (let i = 0; i < container.effects.length; i++) {
      const effect = container.effects[i];
      const pipe = renderPipes[effect.pipe];
      pipe.push(effect, container, instructionSet);
    }
    const renderPipeId = container.renderPipeId;
    if (renderPipeId) {
      renderPipes.blendMode.setBlendMode(container, container.groupBlendMode, instructionSet);
      container.didViewUpdate = false;
      const pipe = renderPipes[renderPipeId];
      pipe.addRenderable(container, instructionSet);
    }
    const children = container.children;
    if (children.length) {
      for (let i = 0; i < children.length; i++) {
        collectAllRenderables(children[i], instructionSet, renderPipes);
      }
    }
    for (let i = container.effects.length - 1; i >= 0; i--) {
      const effect = container.effects[i];
      const pipe = renderPipes[effect.pipe];
      pipe.pop(effect, container, instructionSet);
    }
  }
}

const tempBounds$1 = new Bounds();
class AlphaMaskEffect extends FilterEffect {
  constructor() {
    super();
    this.filters = [new MaskFilter({
      sprite: new Sprite(Texture.EMPTY),
      resolution: "inherit",
      antialias: "inherit"
    })];
  }
  get sprite() {
    return this.filters[0].sprite;
  }
  set sprite(value) {
    this.filters[0].sprite = value;
  }
}
class AlphaMaskPipe {
  constructor(renderer) {
    this._activeMaskStage = [];
    this._renderer = renderer;
  }
  push(mask, maskedContainer, instructionSet) {
    const renderer = this._renderer;
    renderer.renderPipes.batch.break(instructionSet);
    instructionSet.add({
      renderPipeId: "alphaMask",
      action: "pushMaskBegin",
      mask,
      canBundle: false,
      maskedContainer
    });
    if (mask.renderMaskToTexture) {
      const maskContainer = mask.mask;
      maskContainer.includeInBuild = true;
      collectAllRenderables(
        maskContainer,
        instructionSet,
        renderer.renderPipes
      );
      maskContainer.includeInBuild = false;
    }
    renderer.renderPipes.batch.break(instructionSet);
    instructionSet.add({
      renderPipeId: "alphaMask",
      action: "pushMaskEnd",
      mask,
      maskedContainer,
      canBundle: false
    });
  }
  pop(mask, _maskedContainer, instructionSet) {
    const renderer = this._renderer;
    renderer.renderPipes.batch.break(instructionSet);
    instructionSet.add({
      renderPipeId: "alphaMask",
      action: "popMaskEnd",
      mask,
      canBundle: false
    });
  }
  execute(instruction) {
    const renderer = this._renderer;
    const renderMask = instruction.mask.renderMaskToTexture;
    if (instruction.action === "pushMaskBegin") {
      const filterEffect = BigPool.get(AlphaMaskEffect);
      if (renderMask) {
        instruction.mask.mask.measurable = true;
        const bounds = getGlobalBounds(instruction.mask.mask, true, tempBounds$1);
        instruction.mask.mask.measurable = false;
        bounds.ceil();
        const colorTextureSource = renderer.renderTarget.renderTarget.colorTexture.source;
        const filterTexture = TexturePool.getOptimalTexture(
          bounds.width,
          bounds.height,
          colorTextureSource._resolution,
          colorTextureSource.antialias
        );
        renderer.renderTarget.push(filterTexture, true);
        renderer.globalUniforms.push({
          offset: bounds,
          worldColor: 4294967295
        });
        const sprite = filterEffect.sprite;
        sprite.texture = filterTexture;
        sprite.worldTransform.tx = bounds.minX;
        sprite.worldTransform.ty = bounds.minY;
        this._activeMaskStage.push({
          filterEffect,
          maskedContainer: instruction.maskedContainer,
          filterTexture
        });
      } else {
        filterEffect.sprite = instruction.mask.mask;
        this._activeMaskStage.push({
          filterEffect,
          maskedContainer: instruction.maskedContainer
        });
      }
    } else if (instruction.action === "pushMaskEnd") {
      const maskData = this._activeMaskStage[this._activeMaskStage.length - 1];
      if (renderMask) {
        if (renderer.type === RendererType.WEBGL) {
          renderer.renderTarget.finishRenderPass();
        }
        renderer.renderTarget.pop();
        renderer.globalUniforms.pop();
      }
      renderer.filter.push({
        renderPipeId: "filter",
        action: "pushFilter",
        container: maskData.maskedContainer,
        filterEffect: maskData.filterEffect,
        canBundle: false
      });
    } else if (instruction.action === "popMaskEnd") {
      renderer.filter.pop();
      const maskData = this._activeMaskStage.pop();
      if (renderMask) {
        TexturePool.returnTexture(maskData.filterTexture);
      }
      BigPool.return(maskData.filterEffect);
    }
  }
  destroy() {
    this._renderer = null;
    this._activeMaskStage = null;
  }
}
/** @ignore */
AlphaMaskPipe.extension = {
  type: [
    ExtensionType.WebGLPipes,
    ExtensionType.WebGPUPipes,
    ExtensionType.CanvasPipes
  ],
  name: "alphaMask"
};

class ColorMaskPipe {
  constructor(renderer) {
    this._colorStack = [];
    this._colorStackIndex = 0;
    this._currentColor = 0;
    this._renderer = renderer;
  }
  buildStart() {
    this._colorStack[0] = 15;
    this._colorStackIndex = 1;
    this._currentColor = 15;
  }
  push(mask, _container, instructionSet) {
    const renderer = this._renderer;
    renderer.renderPipes.batch.break(instructionSet);
    const colorStack = this._colorStack;
    colorStack[this._colorStackIndex] = colorStack[this._colorStackIndex - 1] & mask.mask;
    const currentColor = this._colorStack[this._colorStackIndex];
    if (currentColor !== this._currentColor) {
      this._currentColor = currentColor;
      instructionSet.add({
        renderPipeId: "colorMask",
        colorMask: currentColor,
        canBundle: false
      });
    }
    this._colorStackIndex++;
  }
  pop(_mask, _container, instructionSet) {
    const renderer = this._renderer;
    renderer.renderPipes.batch.break(instructionSet);
    const colorStack = this._colorStack;
    this._colorStackIndex--;
    const currentColor = colorStack[this._colorStackIndex - 1];
    if (currentColor !== this._currentColor) {
      this._currentColor = currentColor;
      instructionSet.add({
        renderPipeId: "colorMask",
        colorMask: currentColor,
        canBundle: false
      });
    }
  }
  execute(instruction) {
    const renderer = this._renderer;
    renderer.colorMask.setMask(instruction.colorMask);
  }
  destroy() {
    this._colorStack = null;
  }
}
/** @ignore */
ColorMaskPipe.extension = {
  type: [
    ExtensionType.WebGLPipes,
    ExtensionType.WebGPUPipes,
    ExtensionType.CanvasPipes
  ],
  name: "colorMask"
};

class StencilMaskPipe {
  constructor(renderer) {
    // used when building and also when executing..
    this._maskStackHash = {};
    this._maskHash = /* @__PURE__ */ new WeakMap();
    this._renderer = renderer;
  }
  push(mask, _container, instructionSet) {
    var _a;
    const effect = mask;
    const renderer = this._renderer;
    renderer.renderPipes.batch.break(instructionSet);
    renderer.renderPipes.blendMode.setBlendMode(effect.mask, "none", instructionSet);
    instructionSet.add({
      renderPipeId: "stencilMask",
      action: "pushMaskBegin",
      mask,
      canBundle: false
    });
    const maskContainer = effect.mask;
    maskContainer.includeInBuild = true;
    if (!this._maskHash.has(effect)) {
      this._maskHash.set(effect, {
        instructionsStart: 0,
        instructionsLength: 0
      });
    }
    const maskData = this._maskHash.get(effect);
    maskData.instructionsStart = instructionSet.instructionSize;
    collectAllRenderables(
      maskContainer,
      instructionSet,
      renderer.renderPipes
    );
    maskContainer.includeInBuild = false;
    renderer.renderPipes.batch.break(instructionSet);
    instructionSet.add({
      renderPipeId: "stencilMask",
      action: "pushMaskEnd",
      mask,
      canBundle: false
    });
    const instructionsLength = instructionSet.instructionSize - maskData.instructionsStart - 1;
    maskData.instructionsLength = instructionsLength;
    const renderTargetUid = renderer.renderTarget.renderTarget.uid;
    (_a = this._maskStackHash)[renderTargetUid] ?? (_a[renderTargetUid] = 0);
  }
  pop(mask, _container, instructionSet) {
    const effect = mask;
    const renderer = this._renderer;
    renderer.renderPipes.batch.break(instructionSet);
    renderer.renderPipes.blendMode.setBlendMode(effect.mask, "none", instructionSet);
    instructionSet.add({
      renderPipeId: "stencilMask",
      action: "popMaskBegin",
      canBundle: false
    });
    const maskData = this._maskHash.get(mask);
    for (let i = 0; i < maskData.instructionsLength; i++) {
      instructionSet.instructions[instructionSet.instructionSize++] = instructionSet.instructions[maskData.instructionsStart++];
    }
    instructionSet.add({
      renderPipeId: "stencilMask",
      action: "popMaskEnd",
      canBundle: false
    });
  }
  execute(instruction) {
    var _a;
    const renderer = this._renderer;
    const renderTargetUid = renderer.renderTarget.renderTarget.uid;
    let maskStackIndex = (_a = this._maskStackHash)[renderTargetUid] ?? (_a[renderTargetUid] = 0);
    if (instruction.action === "pushMaskBegin") {
      renderer.renderTarget.ensureDepthStencil();
      renderer.stencil.setStencilMode(STENCIL_MODES.RENDERING_MASK_ADD, maskStackIndex);
      maskStackIndex++;
      renderer.colorMask.setMask(0);
    } else if (instruction.action === "pushMaskEnd") {
      renderer.stencil.setStencilMode(STENCIL_MODES.MASK_ACTIVE, maskStackIndex);
      renderer.colorMask.setMask(15);
    } else if (instruction.action === "popMaskBegin") {
      renderer.colorMask.setMask(0);
      if (maskStackIndex !== 0) {
        renderer.stencil.setStencilMode(STENCIL_MODES.RENDERING_MASK_REMOVE, maskStackIndex);
      } else {
        renderer.renderTarget.clear(null, CLEAR.STENCIL);
        renderer.stencil.setStencilMode(STENCIL_MODES.DISABLED, maskStackIndex);
      }
      maskStackIndex--;
    } else if (instruction.action === "popMaskEnd") {
      renderer.stencil.setStencilMode(STENCIL_MODES.MASK_ACTIVE, maskStackIndex);
      renderer.colorMask.setMask(15);
    }
    this._maskStackHash[renderTargetUid] = maskStackIndex;
  }
  destroy() {
    this._renderer = null;
    this._maskStackHash = null;
    this._maskHash = null;
  }
}
StencilMaskPipe.extension = {
  type: [
    ExtensionType.WebGLPipes,
    ExtensionType.WebGPUPipes,
    ExtensionType.CanvasPipes
  ],
  name: "stencilMask"
};

function ensureAttributes(geometry, extractedData) {
  for (const i in geometry.attributes) {
    const attribute = geometry.attributes[i];
    const attributeData = extractedData[i];
    if (attributeData) {
      attribute.location ?? (attribute.location = attributeData.location);
      attribute.format ?? (attribute.format = attributeData.format);
      attribute.offset ?? (attribute.offset = attributeData.offset);
      attribute.instance ?? (attribute.instance = attributeData.instance);
    } else {
      warn(`Attribute ${i} is not present in the shader, but is present in the geometry. Unable to infer attribute details.`);
    }
  }
  ensureStartAndStride(geometry);
}
function ensureStartAndStride(geometry) {
  const { buffers, attributes } = geometry;
  const tempStride = {};
  const tempStart = {};
  for (const j in buffers) {
    const buffer = buffers[j];
    tempStride[buffer.uid] = 0;
    tempStart[buffer.uid] = 0;
  }
  for (const j in attributes) {
    const attribute = attributes[j];
    tempStride[attribute.buffer.uid] += getAttributeInfoFromFormat(attribute.format).stride;
  }
  for (const j in attributes) {
    const attribute = attributes[j];
    attribute.stride ?? (attribute.stride = tempStride[attribute.buffer.uid]);
    attribute.start ?? (attribute.start = tempStart[attribute.buffer.uid]);
    tempStart[attribute.buffer.uid] += getAttributeInfoFromFormat(attribute.format).stride;
  }
}

const GpuStencilModesToPixi = [];
GpuStencilModesToPixi[STENCIL_MODES.NONE] = void 0;
GpuStencilModesToPixi[STENCIL_MODES.DISABLED] = {
  stencilWriteMask: 0,
  stencilReadMask: 0
};
GpuStencilModesToPixi[STENCIL_MODES.RENDERING_MASK_ADD] = {
  stencilFront: {
    compare: "equal",
    passOp: "increment-clamp"
  },
  stencilBack: {
    compare: "equal",
    passOp: "increment-clamp"
  }
};
GpuStencilModesToPixi[STENCIL_MODES.RENDERING_MASK_REMOVE] = {
  stencilFront: {
    compare: "equal",
    passOp: "decrement-clamp"
  },
  stencilBack: {
    compare: "equal",
    passOp: "decrement-clamp"
  }
};
GpuStencilModesToPixi[STENCIL_MODES.MASK_ACTIVE] = {
  stencilWriteMask: 0,
  stencilFront: {
    compare: "equal",
    passOp: "keep"
  },
  stencilBack: {
    compare: "equal",
    passOp: "keep"
  }
};

class UboSystem {
  constructor(adaptor) {
    /** Cache of uniform buffer layouts and sync functions, so we don't have to re-create them */
    this._syncFunctionHash = /* @__PURE__ */ Object.create(null);
    this._adaptor = adaptor;
    this._systemCheck();
  }
  /**
   * Overridable function by `pixi.js/unsafe-eval` to silence
   * throwing an error if platform doesn't support unsafe-evals.
   * @private
   */
  _systemCheck() {
    if (!unsafeEvalSupported()) {
      throw new Error("Current environment does not allow unsafe-eval, please use pixi.js/unsafe-eval module to enable support.");
    }
  }
  ensureUniformGroup(uniformGroup) {
    const uniformData = this.getUniformGroupData(uniformGroup);
    uniformGroup.buffer || (uniformGroup.buffer = new Buffer({
      data: new Float32Array(uniformData.layout.size / 4),
      usage: BufferUsage.UNIFORM | BufferUsage.COPY_DST
    }));
  }
  getUniformGroupData(uniformGroup) {
    return this._syncFunctionHash[uniformGroup._signature] || this._initUniformGroup(uniformGroup);
  }
  _initUniformGroup(uniformGroup) {
    const uniformGroupSignature = uniformGroup._signature;
    let uniformData = this._syncFunctionHash[uniformGroupSignature];
    if (!uniformData) {
      const elements = Object.keys(uniformGroup.uniformStructures).map((i) => uniformGroup.uniformStructures[i]);
      const layout = this._adaptor.createUboElements(elements);
      const syncFunction = this._generateUboSync(layout.uboElements);
      uniformData = this._syncFunctionHash[uniformGroupSignature] = {
        layout,
        syncFunction
      };
    }
    return this._syncFunctionHash[uniformGroupSignature];
  }
  _generateUboSync(uboElements) {
    return this._adaptor.generateUboSync(uboElements);
  }
  syncUniformGroup(uniformGroup, data, offset) {
    const uniformGroupData = this.getUniformGroupData(uniformGroup);
    uniformGroup.buffer || (uniformGroup.buffer = new Buffer({
      data: new Float32Array(uniformGroupData.layout.size / 4),
      usage: BufferUsage.UNIFORM | BufferUsage.COPY_DST
    }));
    data || (data = uniformGroup.buffer.data);
    offset || (offset = 0);
    uniformGroupData.syncFunction(uniformGroup.uniforms, data, offset);
    return true;
  }
  updateUniformGroup(uniformGroup) {
    if (uniformGroup.isStatic && !uniformGroup._dirtyId)
      return false;
    uniformGroup._dirtyId = 0;
    const synced = this.syncUniformGroup(uniformGroup);
    uniformGroup.buffer.update();
    return synced;
  }
  destroy() {
    this._syncFunctionHash = null;
  }
}

const uniformParsers = [
  // uploading pixi matrix object to mat3
  {
    type: "mat3x3<f32>",
    test: (data) => {
      const value = data.value;
      return value.a !== void 0;
    },
    ubo: `
            var matrix = uv[name].toArray(true);
            data[offset] = matrix[0];
            data[offset + 1] = matrix[1];
            data[offset + 2] = matrix[2];
            data[offset + 4] = matrix[3];
            data[offset + 5] = matrix[4];
            data[offset + 6] = matrix[5];
            data[offset + 8] = matrix[6];
            data[offset + 9] = matrix[7];
            data[offset + 10] = matrix[8];
        `,
    uniform: `
            gl.uniformMatrix3fv(ud[name].location, false, uv[name].toArray(true));
        `
  },
  // uploading a pixi rectangle as a vec4
  {
    type: "vec4<f32>",
    test: (data) => data.type === "vec4<f32>" && data.size === 1 && data.value.width !== void 0,
    ubo: `
            v = uv[name];
            data[offset] = v.x;
            data[offset + 1] = v.y;
            data[offset + 2] = v.width;
            data[offset + 3] = v.height;
        `,
    uniform: `
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.x || cv[1] !== v.y || cv[2] !== v.width || cv[3] !== v.height) {
                cv[0] = v.x;
                cv[1] = v.y;
                cv[2] = v.width;
                cv[3] = v.height;
                gl.uniform4f(ud[name].location, v.x, v.y, v.width, v.height);
            }
        `
  },
  // uploading a pixi point as a vec2
  {
    type: "vec2<f32>",
    test: (data) => data.type === "vec2<f32>" && data.size === 1 && data.value.x !== void 0,
    ubo: `
            v = uv[name];
            data[offset] = v.x;
            data[offset + 1] = v.y;
        `,
    uniform: `
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.x || cv[1] !== v.y) {
                cv[0] = v.x;
                cv[1] = v.y;
                gl.uniform2f(ud[name].location, v.x, v.y);
            }
        `
  },
  // uploading a pixi color as a vec4
  {
    type: "vec4<f32>",
    test: (data) => data.type === "vec4<f32>" && data.size === 1 && data.value.red !== void 0,
    ubo: `
            v = uv[name];
            data[offset] = v.red;
            data[offset + 1] = v.green;
            data[offset + 2] = v.blue;
            data[offset + 3] = v.alpha;
        `,
    uniform: `
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.red || cv[1] !== v.green || cv[2] !== v.blue || cv[3] !== v.alpha) {
                cv[0] = v.red;
                cv[1] = v.green;
                cv[2] = v.blue;
                cv[3] = v.alpha;
                gl.uniform4f(ud[name].location, v.red, v.green, v.blue, v.alpha);
            }
        `
  },
  // uploading a pixi color as a vec3
  {
    type: "vec3<f32>",
    test: (data) => data.type === "vec3<f32>" && data.size === 1 && data.value.red !== void 0,
    ubo: `
            v = uv[name];
            data[offset] = v.red;
            data[offset + 1] = v.green;
            data[offset + 2] = v.blue;
        `,
    uniform: `
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.red || cv[1] !== v.green || cv[2] !== v.blue) {
                cv[0] = v.red;
                cv[1] = v.green;
                cv[2] = v.blue;
                gl.uniform3f(ud[name].location, v.red, v.green, v.blue);
            }
        `
  }
];

function createUboSyncFunction(uboElements, parserCode, arrayGenerationFunction, singleSettersMap) {
  const funcFragments = [`
        var v = null;
        var v2 = null;
        var t = 0;
        var index = 0;
        var name = null;
        var arrayOffset = null;
    `];
  let prev = 0;
  for (let i = 0; i < uboElements.length; i++) {
    const uboElement = uboElements[i];
    const name = uboElement.data.name;
    let parsed = false;
    let offset = 0;
    for (let j = 0; j < uniformParsers.length; j++) {
      const uniformParser = uniformParsers[j];
      if (uniformParser.test(uboElement.data)) {
        offset = uboElement.offset / 4;
        funcFragments.push(
          `name = "${name}";`,
          `offset += ${offset - prev};`,
          uniformParsers[j][parserCode] || uniformParsers[j].ubo
        );
        parsed = true;
        break;
      }
    }
    if (!parsed) {
      if (uboElement.data.size > 1) {
        offset = uboElement.offset / 4;
        funcFragments.push(arrayGenerationFunction(uboElement, offset - prev));
      } else {
        const template = singleSettersMap[uboElement.data.type];
        offset = uboElement.offset / 4;
        funcFragments.push(
          /* wgsl */
          `
                    v = uv.${name};
                    offset += ${offset - prev};
                    ${template};
                `
        );
      }
    }
    prev = offset;
  }
  const fragmentSrc = funcFragments.join("\n");
  return new Function(
    "uv",
    "data",
    "offset",
    fragmentSrc
  );
}

function loopMatrix(col, row) {
  const total = col * row;
  return `
        for (let i = 0; i < ${total}; i++) {
            data[offset + (((i / ${col})|0) * 4) + (i % ${col})] = v[i];
        }
    `;
}
const uboSyncFunctionsSTD40 = {
  f32: `
        data[offset] = v;`,
  i32: `
        data[offset] = v;`,
  "vec2<f32>": `
        data[offset] = v[0];
        data[offset + 1] = v[1];`,
  "vec3<f32>": `
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];`,
  "vec4<f32>": `
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];
        data[offset + 3] = v[3];`,
  "mat2x2<f32>": `
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 4] = v[2];
        data[offset + 5] = v[3];`,
  "mat3x3<f32>": `
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];
        data[offset + 4] = v[3];
        data[offset + 5] = v[4];
        data[offset + 6] = v[5];
        data[offset + 8] = v[6];
        data[offset + 9] = v[7];
        data[offset + 10] = v[8];`,
  "mat4x4<f32>": `
        for (let i = 0; i < 16; i++) {
            data[offset + i] = v[i];
        }`,
  "mat3x2<f32>": loopMatrix(3, 2),
  "mat4x2<f32>": loopMatrix(4, 2),
  "mat2x3<f32>": loopMatrix(2, 3),
  "mat4x3<f32>": loopMatrix(4, 3),
  "mat2x4<f32>": loopMatrix(2, 4),
  "mat3x4<f32>": loopMatrix(3, 4)
};
const uboSyncFunctionsWGSL = {
  ...uboSyncFunctionsSTD40,
  "mat2x2<f32>": `
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];
        data[offset + 3] = v[3];
    `
};

function calculateProjection(pm, x, y, width, height, flipY) {
  const sign = flipY ? 1 : -1;
  pm.identity();
  pm.a = 1 / width * 2;
  pm.d = sign * (1 / height * 2);
  pm.tx = -1 - x * pm.a;
  pm.ty = -sign - y * pm.d;
  return pm;
}

const canvasCache = /* @__PURE__ */ new Map();
function getCanvasTexture(canvas, options) {
  if (!canvasCache.has(canvas)) {
    const texture = new Texture({
      source: new CanvasSource({
        resource: canvas,
        ...options
      })
    });
    const onDestroy = () => {
      if (canvasCache.get(canvas) === texture) {
        canvasCache.delete(canvas);
      }
    };
    texture.once("destroy", onDestroy);
    texture.source.once("destroy", onDestroy);
    canvasCache.set(canvas, texture);
  }
  return canvasCache.get(canvas);
}

function isRenderingToScreen(renderTarget) {
  const resource = renderTarget.colorTexture.source.resource;
  return globalThis.HTMLCanvasElement && resource instanceof HTMLCanvasElement && document.body.contains(resource);
}

const _RenderTarget = class _RenderTarget {
  /**
   * @param [descriptor] - Options for creating a render target.
   */
  constructor(descriptor = {}) {
    /** unique id for this render target */
    this.uid = uid("renderTarget");
    /**
     * An array of textures that can be written to by the GPU - mostly this has one texture in Pixi, but you could
     * write to multiple if required! (eg deferred lighting)
     */
    this.colorTextures = [];
    this.dirtyId = 0;
    this.isRoot = false;
    this._size = new Float32Array(2);
    /** if true, then when the render target is destroyed, it will destroy all the textures that were created for it. */
    this._managedColorTextures = false;
    descriptor = { ..._RenderTarget.defaultOptions, ...descriptor };
    this.stencil = descriptor.stencil;
    this.depth = descriptor.depth;
    this.isRoot = descriptor.isRoot;
    if (typeof descriptor.colorTextures === "number") {
      this._managedColorTextures = true;
      for (let i = 0; i < descriptor.colorTextures; i++) {
        this.colorTextures.push(
          new TextureSource({
            width: descriptor.width,
            height: descriptor.height,
            resolution: descriptor.resolution,
            antialias: descriptor.antialias
          })
        );
      }
    } else {
      this.colorTextures = [...descriptor.colorTextures.map((texture) => texture.source)];
      const colorSource = this.colorTexture.source;
      this.resize(colorSource.width, colorSource.height, colorSource._resolution);
    }
    this.colorTexture.source.on("resize", this.onSourceResize, this);
    if (descriptor.depthStencilTexture || this.stencil) {
      if (descriptor.depthStencilTexture instanceof Texture || descriptor.depthStencilTexture instanceof TextureSource) {
        this.depthStencilTexture = descriptor.depthStencilTexture.source;
      } else {
        this.ensureDepthStencilTexture();
      }
    }
  }
  get size() {
    const _size = this._size;
    _size[0] = this.pixelWidth;
    _size[1] = this.pixelHeight;
    return _size;
  }
  get width() {
    return this.colorTexture.source.width;
  }
  get height() {
    return this.colorTexture.source.height;
  }
  get pixelWidth() {
    return this.colorTexture.source.pixelWidth;
  }
  get pixelHeight() {
    return this.colorTexture.source.pixelHeight;
  }
  get resolution() {
    return this.colorTexture.source._resolution;
  }
  get colorTexture() {
    return this.colorTextures[0];
  }
  onSourceResize(source) {
    this.resize(source.width, source.height, source._resolution, true);
  }
  /**
   * This will ensure a depthStencil texture is created for this render target.
   * Most likely called by the mask system to make sure we have stencil buffer added.
   * @internal
   * @ignore
   */
  ensureDepthStencilTexture() {
    if (!this.depthStencilTexture) {
      this.depthStencilTexture = new TextureSource({
        width: this.width,
        height: this.height,
        resolution: this.resolution,
        format: "depth24plus-stencil8",
        autoGenerateMipmaps: false,
        antialias: false,
        mipLevelCount: 1
        // sampleCount: handled by the render target system..
      });
    }
  }
  resize(width, height, resolution = this.resolution, skipColorTexture = false) {
    this.dirtyId++;
    this.colorTextures.forEach((colorTexture, i) => {
      if (skipColorTexture && i === 0)
        return;
      colorTexture.source.resize(width, height, resolution);
    });
    if (this.depthStencilTexture) {
      this.depthStencilTexture.source.resize(width, height, resolution);
    }
  }
  destroy() {
    this.colorTexture.source.off("resize", this.onSourceResize, this);
    if (this._managedColorTextures) {
      this.colorTextures.forEach((texture) => {
        texture.destroy();
      });
    }
    if (this.depthStencilTexture) {
      this.depthStencilTexture.destroy();
      delete this.depthStencilTexture;
    }
  }
};
/** The default options for a render target */
_RenderTarget.defaultOptions = {
  /** the width of the RenderTarget */
  width: 0,
  /** the height of the RenderTarget */
  height: 0,
  /** the resolution of the RenderTarget */
  resolution: 1,
  /** an array of textures, or a number indicating how many color textures there should be */
  colorTextures: 1,
  /** should this render target have a stencil buffer? */
  stencil: false,
  /** should this render target have a depth buffer? */
  depth: false,
  /** should this render target be antialiased? */
  antialias: false,
  // save on perf by default!
  /** is this a root element, true if this is gl context owners render target */
  isRoot: false
};
let RenderTarget = _RenderTarget;

class RenderTargetSystem {
  constructor(renderer) {
    /** This is the root viewport for the render pass*/
    this.rootViewPort = new Rectangle();
    /** the current viewport that the gpu is using */
    this.viewport = new Rectangle();
    /**
     * a runner that lets systems know if the active render target has changed.
     * Eg the Stencil System needs to know so it can manage the stencil buffer
     */
    this.onRenderTargetChange = new SystemRunner("onRenderTargetChange");
    /** the projection matrix that is used by the shaders based on the active render target and the viewport */
    this.projectionMatrix = new Matrix();
    /** the default clear color for render targets */
    this.defaultClearColor = [0, 0, 0, 0];
    /**
     * a hash that stores the render target for a given render surface. When you pass in a texture source,
     * a render target is created for it. This map stores and makes it easy to retrieve the render target
     */
    this._renderSurfaceToRenderTargetHash = /* @__PURE__ */ new Map();
    /** A hash that stores a gpu render target for a given render target. */
    this._gpuRenderTargetHash = /* @__PURE__ */ Object.create(null);
    /**
     * A stack that stores the render target and frame that is currently being rendered to.
     * When push is called, the current render target is stored in this stack.
     * When pop is called, the previous render target is restored.
     */
    this._renderTargetStack = [];
    this._renderer = renderer;
  }
  /** called when dev wants to finish a render pass */
  finishRenderPass() {
    this.adaptor.finishRenderPass(this.renderTarget);
  }
  /**
   * called when the renderer starts to render a scene.
   * @param options
   * @param options.target - the render target to render to
   * @param options.clear - the clear mode to use. Can be true or a CLEAR number 'COLOR | DEPTH | STENCIL' 0b111
   * @param options.clearColor - the color to clear to
   * @param options.frame - the frame to render to
   */
  renderStart({
    target,
    clear,
    clearColor,
    frame
  }) {
    this._renderTargetStack.length = 0;
    this.push(
      target,
      clear,
      clearColor,
      frame
    );
    this.rootViewPort.copyFrom(this.viewport);
    this.rootRenderTarget = this.renderTarget;
    this.renderingToScreen = isRenderingToScreen(this.rootRenderTarget);
  }
  /**
   * Binding a render surface! This is the main function of the render target system.
   * It will take the RenderSurface (which can be a texture, canvas, or render target) and bind it to the renderer.
   * Once bound all draw calls will be rendered to the render surface.
   *
   * If a frame is not provide and the render surface is a texture, the frame of the texture will be used.
   * @param renderSurface - the render surface to bind
   * @param clear - the clear mode to use. Can be true or a CLEAR number 'COLOR | DEPTH | STENCIL' 0b111
   * @param clearColor - the color to clear to
   * @param frame - the frame to render to
   * @returns the render target that was bound
   */
  bind(renderSurface, clear = true, clearColor, frame) {
    const renderTarget = this.getRenderTarget(renderSurface);
    const didChange = this.renderTarget !== renderTarget;
    this.renderTarget = renderTarget;
    this.renderSurface = renderSurface;
    const gpuRenderTarget = this.getGpuRenderTarget(renderTarget);
    if (renderTarget.pixelWidth !== gpuRenderTarget.width || renderTarget.pixelHeight !== gpuRenderTarget.height) {
      this.adaptor.resizeGpuRenderTarget(renderTarget);
      gpuRenderTarget.width = renderTarget.pixelWidth;
      gpuRenderTarget.height = renderTarget.pixelHeight;
    }
    const source = renderTarget.colorTexture;
    const viewport = this.viewport;
    const pixelWidth = source.pixelWidth;
    const pixelHeight = source.pixelHeight;
    if (!frame && renderSurface instanceof Texture) {
      frame = renderSurface.frame;
    }
    if (frame) {
      const resolution = source._resolution;
      viewport.x = frame.x * resolution + 0.5 | 0;
      viewport.y = frame.y * resolution + 0.5 | 0;
      viewport.width = frame.width * resolution + 0.5 | 0;
      viewport.height = frame.height * resolution + 0.5 | 0;
    } else {
      viewport.x = 0;
      viewport.y = 0;
      viewport.width = pixelWidth;
      viewport.height = pixelHeight;
    }
    calculateProjection(
      this.projectionMatrix,
      0,
      0,
      viewport.width / source.resolution,
      viewport.height / source.resolution,
      !renderTarget.isRoot
    );
    this.adaptor.startRenderPass(renderTarget, clear, clearColor, viewport);
    if (didChange) {
      this.onRenderTargetChange.emit(renderTarget);
    }
    return renderTarget;
  }
  clear(target, clear = CLEAR.ALL, clearColor) {
    if (!clear)
      return;
    if (target) {
      target = this.getRenderTarget(target);
    }
    this.adaptor.clear(
      target || this.renderTarget,
      clear,
      clearColor,
      this.viewport
    );
  }
  contextChange() {
    this._gpuRenderTargetHash = /* @__PURE__ */ Object.create(null);
  }
  /**
   * Push a render surface to the renderer. This will bind the render surface to the renderer,
   * @param renderSurface - the render surface to push
   * @param clear - the clear mode to use. Can be true or a CLEAR number 'COLOR | DEPTH | STENCIL' 0b111
   * @param clearColor - the color to clear to
   * @param frame - the frame to use when rendering to the render surface
   */
  push(renderSurface, clear = CLEAR.ALL, clearColor, frame) {
    const renderTarget = this.bind(renderSurface, clear, clearColor, frame);
    this._renderTargetStack.push({
      renderTarget,
      frame
    });
    return renderTarget;
  }
  /** Pops the current render target from the renderer and restores the previous render target. */
  pop() {
    this._renderTargetStack.pop();
    const currentRenderTargetData = this._renderTargetStack[this._renderTargetStack.length - 1];
    this.bind(currentRenderTargetData.renderTarget, false, null, currentRenderTargetData.frame);
  }
  /**
   * Gets the render target from the provide render surface. Eg if its a texture,
   * it will return the render target for the texture.
   * If its a render target, it will return the same render target.
   * @param renderSurface - the render surface to get the render target for
   * @returns the render target for the render surface
   */
  getRenderTarget(renderSurface) {
    if (renderSurface.isTexture) {
      renderSurface = renderSurface.source;
    }
    return this._renderSurfaceToRenderTargetHash.get(renderSurface) ?? this._initRenderTarget(renderSurface);
  }
  /**
   * Copies a render surface to another texture
   * @param sourceRenderSurfaceTexture - the render surface to copy from
   * @param destinationTexture - the texture to copy to
   * @param originSrc - the origin of the copy
   * @param originSrc.x - the x origin of the copy
   * @param originSrc.y - the y origin of the copy
   * @param size - the size of the copy
   * @param size.width - the width of the copy
   * @param size.height - the height of the copy
   * @param originDest - the destination origin (top left to paste from!)
   * @param originDest.x - the x origin of the paste
   * @param originDest.y - the y origin of the paste
   */
  copyToTexture(sourceRenderSurfaceTexture, destinationTexture, originSrc, size, originDest) {
    if (originSrc.x < 0) {
      size.width += originSrc.x;
      originDest.x -= originSrc.x;
      originSrc.x = 0;
    }
    if (originSrc.y < 0) {
      size.height += originSrc.y;
      originDest.y -= originSrc.y;
      originSrc.y = 0;
    }
    const { pixelWidth, pixelHeight } = sourceRenderSurfaceTexture;
    size.width = Math.min(size.width, pixelWidth - originSrc.x);
    size.height = Math.min(size.height, pixelHeight - originSrc.y);
    return this.adaptor.copyToTexture(
      sourceRenderSurfaceTexture,
      destinationTexture,
      originSrc,
      size,
      originDest
    );
  }
  /**
   * ensures that we have a depth stencil buffer available to render to
   * This is used by the mask system to make sure we have a stencil buffer.
   */
  ensureDepthStencil() {
    if (!this.renderTarget.stencil) {
      this.renderTarget.stencil = true;
      this.adaptor.startRenderPass(this.renderTarget, false, null, this.viewport);
    }
  }
  /** nukes the render target system */
  destroy() {
    this._renderer = null;
    this._renderSurfaceToRenderTargetHash.forEach((renderTarget, key) => {
      if (renderTarget !== key) {
        renderTarget.destroy();
      }
    });
    this._renderSurfaceToRenderTargetHash.clear();
    this._gpuRenderTargetHash = /* @__PURE__ */ Object.create(null);
  }
  _initRenderTarget(renderSurface) {
    let renderTarget = null;
    if (CanvasSource.test(renderSurface)) {
      renderSurface = getCanvasTexture(renderSurface).source;
    }
    if (renderSurface instanceof RenderTarget) {
      renderTarget = renderSurface;
    } else if (renderSurface instanceof TextureSource) {
      renderTarget = new RenderTarget({
        colorTextures: [renderSurface]
      });
      if (CanvasSource.test(renderSurface.source.resource)) {
        renderTarget.isRoot = true;
      }
      renderSurface.once("destroy", () => {
        renderTarget.destroy();
        const gpuRenderTarget = this._gpuRenderTargetHash[renderTarget.uid];
        if (gpuRenderTarget) {
          this._gpuRenderTargetHash[renderTarget.uid] = null;
          this.adaptor.destroyGpuRenderTarget(gpuRenderTarget);
        }
      });
    }
    this._renderSurfaceToRenderTargetHash.set(renderSurface, renderTarget);
    return renderTarget;
  }
  getGpuRenderTarget(renderTarget) {
    return this._gpuRenderTargetHash[renderTarget.uid] || (this._gpuRenderTargetHash[renderTarget.uid] = this.adaptor.initGpuRenderTarget(renderTarget));
  }
}

class BufferResource extends EventEmitter {
  /**
   * Create a new Buffer Resource.
   * @param options - The options for the buffer resource
   * @param options.buffer - The underlying buffer that this resource is using
   * @param options.offset - The offset of the buffer this resource is using.
   * If not provided, then it will use the offset of the buffer.
   * @param options.size - The size of the buffer this resource is using.
   * If not provided, then it will use the size of the buffer.
   */
  constructor({ buffer, offset, size }) {
    super();
    /**
     * emits when the underlying buffer has changed shape (i.e. resized)
     * letting the renderer know that it needs to discard the old buffer on the GPU and create a new one
     * @event change
     */
    /** a unique id for this uniform group used through the renderer */
    this.uid = uid("buffer");
    /**
     * a resource type, used to identify how to handle it when its in a bind group / shader resource
     * @internal
     * @ignore
     */
    this._resourceType = "bufferResource";
    /**
     * used internally to know if a uniform group was used in the last render pass
     * @internal
     * @ignore
     */
    this._touched = 0;
    /**
     * the resource id used internally by the renderer to build bind group keys
     * @internal
     * @ignore
     */
    this._resourceId = uid("resource");
    /**
     * A cheeky hint to the GL renderer to let it know this is a BufferResource
     * @internal
     * @ignore
     */
    this._bufferResource = true;
    /**
     * Has the Buffer resource been destroyed?
     * @readonly
     */
    this.destroyed = false;
    this.buffer = buffer;
    this.offset = offset | 0;
    this.size = size;
    this.buffer.on("change", this.onBufferChange, this);
  }
  onBufferChange() {
    this._resourceId = uid("resource");
    this.emit("change", this);
  }
  /**
   * Destroys this resource. Make sure the underlying buffer is not used anywhere else
   * if you want to destroy it as well, or code will explode
   * @param destroyBuffer - Should the underlying buffer be destroyed as well?
   */
  destroy(destroyBuffer = false) {
    this.destroyed = true;
    if (destroyBuffer) {
      this.buffer.destroy();
    }
    this.emit("change", this);
    this.buffer = null;
  }
}

class CustomRenderPipe {
  constructor(renderer) {
    this._renderer = renderer;
  }
  addRenderable(container, instructionSet) {
    this._renderer.renderPipes.batch.break(instructionSet);
    instructionSet.add(container);
  }
  execute(container) {
    if (!container.isRenderable)
      return;
    container.render(this._renderer);
  }
  destroy() {
    this._renderer = null;
  }
}
CustomRenderPipe.extension = {
  type: [
    ExtensionType.WebGLPipes,
    ExtensionType.WebGPUPipes,
    ExtensionType.CanvasPipes
  ],
  name: "customRender"
};

function executeInstructions(renderGroup, renderer) {
  const instructionSet = renderGroup.instructionSet;
  const instructions = instructionSet.instructions;
  for (let i = 0; i < instructionSet.instructionSize; i++) {
    const instruction = instructions[i];
    renderer[instruction.renderPipeId].execute(instruction);
  }
}

class RenderGroupPipe {
  constructor(renderer) {
    this._renderer = renderer;
  }
  addRenderGroup(renderGroup, instructionSet) {
    this._renderer.renderPipes.batch.break(instructionSet);
    instructionSet.add(renderGroup);
  }
  execute(renderGroup) {
    if (!renderGroup.isRenderable)
      return;
    this._renderer.globalUniforms.push({
      worldTransformMatrix: renderGroup.worldTransform,
      worldColor: renderGroup.worldColorAlpha
    });
    executeInstructions(renderGroup, this._renderer.renderPipes);
    this._renderer.globalUniforms.pop();
  }
  destroy() {
    this._renderer = null;
  }
}
RenderGroupPipe.extension = {
  type: [
    ExtensionType.WebGLPipes,
    ExtensionType.WebGPUPipes,
    ExtensionType.CanvasPipes
  ],
  name: "renderGroup"
};

function collectRenderGroups(renderGroup, out = []) {
  out.push(renderGroup);
  for (let i = 0; i < renderGroup.renderGroupChildren.length; i++) {
    collectRenderGroups(renderGroup.renderGroupChildren[i], out);
  }
  return out;
}

function mixHexColors(color1, color2, ratio) {
  const r1 = color1 >> 16 & 255;
  const g1 = color1 >> 8 & 255;
  const b1 = color1 & 255;
  const r2 = color2 >> 16 & 255;
  const g2 = color2 >> 8 & 255;
  const b2 = color2 & 255;
  const r = r1 + (r2 - r1) * ratio;
  const g = g1 + (g2 - g1) * ratio;
  const b = b1 + (b2 - b1) * ratio;
  return (r << 16) + (g << 8) + b;
}

const WHITE_BGR = 16777215;
function mixColors(localBGRColor, parentBGRColor) {
  if (localBGRColor === WHITE_BGR || parentBGRColor === WHITE_BGR) {
    return localBGRColor + parentBGRColor - WHITE_BGR;
  }
  return mixHexColors(localBGRColor, parentBGRColor, 0.5);
}

const tempContainer = new Container();
const UPDATE_BLEND_COLOR_VISIBLE = UPDATE_VISIBLE | UPDATE_COLOR | UPDATE_BLEND;
function updateRenderGroupTransforms(renderGroup, updateChildRenderGroups = false) {
  updateRenderGroupTransform(renderGroup);
  const childrenToUpdate = renderGroup.childrenToUpdate;
  const updateTick = renderGroup.updateTick++;
  for (const j in childrenToUpdate) {
    const renderGroupDepth = Number(j);
    const childrenAtDepth = childrenToUpdate[j];
    const list = childrenAtDepth.list;
    const index = childrenAtDepth.index;
    for (let i = 0; i < index; i++) {
      const child = list[i];
      if (child.parentRenderGroup === renderGroup && child.relativeRenderGroupDepth === renderGroupDepth) {
        updateTransformAndChildren(child, updateTick, 0);
      }
    }
    childrenAtDepth.index = 0;
  }
  if (updateChildRenderGroups) {
    for (let i = 0; i < renderGroup.renderGroupChildren.length; i++) {
      updateRenderGroupTransforms(renderGroup.renderGroupChildren[i], updateChildRenderGroups);
    }
  }
}
function updateRenderGroupTransform(renderGroup) {
  const root = renderGroup.root;
  let worldAlpha;
  if (renderGroup.renderGroupParent) {
    const renderGroupParent = renderGroup.renderGroupParent;
    renderGroup.worldTransform.appendFrom(
      root.relativeGroupTransform,
      renderGroupParent.worldTransform
    );
    renderGroup.worldColor = mixColors(
      root.groupColor,
      renderGroupParent.worldColor
    );
    worldAlpha = root.groupAlpha * renderGroupParent.worldAlpha;
  } else {
    renderGroup.worldTransform.copyFrom(root.localTransform);
    renderGroup.worldColor = root.localColor;
    worldAlpha = root.localAlpha;
  }
  worldAlpha = worldAlpha < 0 ? 0 : worldAlpha > 1 ? 1 : worldAlpha;
  renderGroup.worldAlpha = worldAlpha;
  renderGroup.worldColorAlpha = renderGroup.worldColor + ((worldAlpha * 255 | 0) << 24);
}
function updateTransformAndChildren(container, updateTick, updateFlags) {
  if (updateTick === container.updateTick)
    return;
  container.updateTick = updateTick;
  container.didChange = false;
  const localTransform = container.localTransform;
  container.updateLocalTransform();
  const parent = container.parent;
  if (parent && !parent.renderGroup) {
    updateFlags = updateFlags | container._updateFlags;
    container.relativeGroupTransform.appendFrom(
      localTransform,
      parent.relativeGroupTransform
    );
    if (updateFlags & UPDATE_BLEND_COLOR_VISIBLE) {
      updateColorBlendVisibility(container, parent, updateFlags);
    }
  } else {
    updateFlags = container._updateFlags;
    container.relativeGroupTransform.copyFrom(localTransform);
    if (updateFlags & UPDATE_BLEND_COLOR_VISIBLE) {
      updateColorBlendVisibility(container, tempContainer, updateFlags);
    }
  }
  if (!container.renderGroup) {
    const children = container.children;
    const length = children.length;
    for (let i = 0; i < length; i++) {
      updateTransformAndChildren(children[i], updateTick, updateFlags);
    }
    const renderGroup = container.parentRenderGroup;
    if (container.renderPipeId && !renderGroup.structureDidChange) {
      renderGroup.updateRenderable(container);
    }
  }
}
function updateColorBlendVisibility(container, parent, updateFlags) {
  if (updateFlags & UPDATE_COLOR) {
    container.groupColor = mixColors(
      container.localColor,
      parent.groupColor
    );
    let groupAlpha = container.localAlpha * parent.groupAlpha;
    groupAlpha = groupAlpha < 0 ? 0 : groupAlpha > 1 ? 1 : groupAlpha;
    container.groupAlpha = groupAlpha;
    container.groupColorAlpha = container.groupColor + ((groupAlpha * 255 | 0) << 24);
  }
  if (updateFlags & UPDATE_BLEND) {
    container.groupBlendMode = container.localBlendMode === "inherit" ? parent.groupBlendMode : container.localBlendMode;
  }
  if (updateFlags & UPDATE_VISIBLE) {
    container.globalDisplayStatus = container.localDisplayStatus & parent.globalDisplayStatus;
  }
  container._updateFlags = 0;
}

function validateRenderables(renderGroup, renderPipes) {
  const { list, index } = renderGroup.childrenRenderablesToUpdate;
  let rebuildRequired = false;
  for (let i = 0; i < index; i++) {
    const container = list[i];
    const renderable = container;
    const pipe = renderPipes[renderable.renderPipeId];
    rebuildRequired = pipe.validateRenderable(container);
    if (rebuildRequired) {
      break;
    }
  }
  renderGroup.structureDidChange = rebuildRequired;
  return rebuildRequired;
}

const tempMatrix = new Matrix();
class RenderGroupSystem {
  constructor(renderer) {
    this._renderer = renderer;
  }
  render({ container, transform }) {
    container.isRenderGroup = true;
    const parent = container.parent;
    const renderGroupParent = container.renderGroup.renderGroupParent;
    container.parent = null;
    container.renderGroup.renderGroupParent = null;
    const renderer = this._renderer;
    const renderGroups = collectRenderGroups(container.renderGroup, []);
    let originalLocalTransform = tempMatrix;
    if (transform) {
      originalLocalTransform = originalLocalTransform.copyFrom(container.renderGroup.localTransform);
      container.renderGroup.localTransform.copyFrom(transform);
    }
    const renderPipes = renderer.renderPipes;
    for (let i = 0; i < renderGroups.length; i++) {
      const renderGroup = renderGroups[i];
      renderGroup.runOnRender();
      renderGroup.instructionSet.renderPipes = renderPipes;
      if (!renderGroup.structureDidChange) {
        validateRenderables(renderGroup, renderPipes);
      }
      updateRenderGroupTransforms(renderGroup);
      if (renderGroup.structureDidChange) {
        renderGroup.structureDidChange = false;
        buildInstructions(renderGroup, renderPipes);
      } else {
        updateRenderables(renderGroup);
      }
      renderGroup.childrenRenderablesToUpdate.index = 0;
      renderer.renderPipes.batch.upload(renderGroup.instructionSet);
    }
    renderer.globalUniforms.start({
      worldTransformMatrix: transform ? container.renderGroup.localTransform : container.renderGroup.worldTransform,
      worldColor: container.renderGroup.worldColorAlpha
    });
    executeInstructions(container.renderGroup, renderPipes);
    if (renderPipes.uniformBatch) {
      renderPipes.uniformBatch.renderEnd();
    }
    if (transform) {
      container.renderGroup.localTransform.copyFrom(originalLocalTransform);
    }
    container.parent = parent;
    container.renderGroup.renderGroupParent = renderGroupParent;
  }
  destroy() {
    this._renderer = null;
  }
}
/** @ignore */
RenderGroupSystem.extension = {
  type: [
    ExtensionType.WebGLSystem,
    ExtensionType.WebGPUSystem,
    ExtensionType.CanvasSystem
  ],
  name: "renderGroup"
};
function updateRenderables(renderGroup) {
  const { list, index } = renderGroup.childrenRenderablesToUpdate;
  for (let i = 0; i < index; i++) {
    const container = list[i];
    if (container.didViewUpdate) {
      renderGroup.updateRenderable(container);
    }
  }
}

class SpritePipe {
  constructor(renderer) {
    this._gpuSpriteHash = /* @__PURE__ */ Object.create(null);
    this._renderer = renderer;
  }
  addRenderable(sprite, _instructionSet) {
    const gpuSprite = this._getGpuSprite(sprite);
    if (sprite._didSpriteUpdate)
      this._updateBatchableSprite(sprite, gpuSprite);
    this._renderer.renderPipes.batch.addToBatch(gpuSprite);
  }
  updateRenderable(sprite) {
    const gpuSprite = this._gpuSpriteHash[sprite.uid];
    if (sprite._didSpriteUpdate)
      this._updateBatchableSprite(sprite, gpuSprite);
    gpuSprite.batcher.updateElement(gpuSprite);
  }
  validateRenderable(sprite) {
    const texture = sprite._texture;
    const gpuSprite = this._getGpuSprite(sprite);
    if (gpuSprite.texture._source !== texture._source) {
      return !gpuSprite.batcher.checkAndUpdateTexture(gpuSprite, texture);
    }
    return false;
  }
  destroyRenderable(sprite) {
    const batchableSprite = this._gpuSpriteHash[sprite.uid];
    BigPool.return(batchableSprite);
    this._gpuSpriteHash[sprite.uid] = null;
  }
  _updateBatchableSprite(sprite, batchableSprite) {
    sprite._didSpriteUpdate = false;
    batchableSprite.bounds = sprite.bounds;
    batchableSprite.texture = sprite._texture;
  }
  _getGpuSprite(sprite) {
    return this._gpuSpriteHash[sprite.uid] || this._initGPUSprite(sprite);
  }
  _initGPUSprite(sprite) {
    const batchableSprite = BigPool.get(BatchableSprite);
    batchableSprite.renderable = sprite;
    batchableSprite.texture = sprite._texture;
    batchableSprite.bounds = sprite.bounds;
    batchableSprite.roundPixels = this._renderer._roundPixels | sprite._roundPixels;
    this._gpuSpriteHash[sprite.uid] = batchableSprite;
    sprite._didSpriteUpdate = false;
    sprite.on("destroyed", () => {
      this.destroyRenderable(sprite);
    });
    return batchableSprite;
  }
  destroy() {
    for (const i in this._gpuSpriteHash) {
      BigPool.return(this._gpuSpriteHash[i]);
    }
    this._gpuSpriteHash = null;
    this._renderer = null;
  }
}
/** @ignore */
SpritePipe.extension = {
  type: [
    ExtensionType.WebGLPipes,
    ExtensionType.WebGPUPipes,
    ExtensionType.CanvasPipes
  ],
  name: "sprite"
};

const _BackgroundSystem = class _BackgroundSystem {
  constructor() {
    this.clearBeforeRender = true;
    this._backgroundColor = new Color(0);
    this.color = this._backgroundColor;
    this.alpha = 1;
  }
  /**
   * initiates the background system
   * @param options - the options for the background colors
   */
  init(options) {
    options = { ..._BackgroundSystem.defaultOptions, ...options };
    this.clearBeforeRender = options.clearBeforeRender;
    this.color = options.background || options.backgroundColor || this._backgroundColor;
    this.alpha = options.backgroundAlpha;
    this._backgroundColor.setAlpha(options.backgroundAlpha);
  }
  /** The background color to fill if not transparent */
  get color() {
    return this._backgroundColor;
  }
  set color(value) {
    this._backgroundColor.setValue(value);
  }
  /** The background color alpha. Setting this to 0 will make the canvas transparent. */
  get alpha() {
    return this._backgroundColor.alpha;
  }
  set alpha(value) {
    this._backgroundColor.setAlpha(value);
  }
  /** The background color as an [R, G, B, A] array. */
  get colorRgba() {
    return this._backgroundColor.toArray();
  }
  /**
   * destroys the background system
   * @internal
   * @ignore
   */
  destroy() {
  }
};
/** @ignore */
_BackgroundSystem.extension = {
  type: [
    ExtensionType.WebGLSystem,
    ExtensionType.WebGPUSystem,
    ExtensionType.CanvasSystem
  ],
  name: "background",
  priority: 0
};
/** default options used by the system */
_BackgroundSystem.defaultOptions = {
  /**
   * {@link WebGLOptions.backgroundAlpha}
   * @default 1
   */
  backgroundAlpha: 1,
  /**
   * {@link WebGLOptions.backgroundColor}
   * @default 0x000000
   */
  backgroundColor: 0,
  /**
   * {@link WebGLOptions.clearBeforeRender}
   * @default true
   */
  clearBeforeRender: true
};
let BackgroundSystem = _BackgroundSystem;

const BLEND_MODE_FILTERS = {};
extensions.handle(ExtensionType.BlendMode, (value) => {
  if (!value.name) {
    throw new Error("BlendMode extension must have a name property");
  }
  BLEND_MODE_FILTERS[value.name] = value.ref;
}, (value) => {
  delete BLEND_MODE_FILTERS[value.name];
});
class BlendModePipe {
  constructor(renderer) {
    this._isAdvanced = false;
    this._filterHash = /* @__PURE__ */ Object.create(null);
    this._renderer = renderer;
  }
  /**
   * This ensures that a blendMode switch is added to the instruction set if the blend mode has changed.
   * @param renderable - The renderable we are adding to the instruction set
   * @param blendMode - The blend mode of the renderable
   * @param instructionSet - The instruction set we are adding to
   */
  setBlendMode(renderable, blendMode, instructionSet) {
    if (this._activeBlendMode === blendMode) {
      if (this._isAdvanced)
        this._renderableList.push(renderable);
      return;
    }
    this._activeBlendMode = blendMode;
    if (this._isAdvanced) {
      this._endAdvancedBlendMode(instructionSet);
    }
    this._isAdvanced = !!BLEND_MODE_FILTERS[blendMode];
    if (this._isAdvanced) {
      this._beginAdvancedBlendMode(instructionSet);
      this._renderableList.push(renderable);
    }
  }
  _beginAdvancedBlendMode(instructionSet) {
    this._renderer.renderPipes.batch.break(instructionSet);
    const blendMode = this._activeBlendMode;
    if (!BLEND_MODE_FILTERS[blendMode]) {
      warn(`Unable to assign BlendMode: '${blendMode}'. You may want to include: import 'pixi.js/advanced-blend-modes'`);
      return;
    }
    let filterEffect = this._filterHash[blendMode];
    if (!filterEffect) {
      filterEffect = this._filterHash[blendMode] = new FilterEffect();
      filterEffect.filters = [new BLEND_MODE_FILTERS[blendMode]()];
    }
    const instruction = {
      renderPipeId: "filter",
      action: "pushFilter",
      renderables: [],
      filterEffect,
      canBundle: false
    };
    this._renderableList = instruction.renderables;
    instructionSet.add(instruction);
  }
  _endAdvancedBlendMode(instructionSet) {
    this._renderableList = null;
    this._renderer.renderPipes.batch.break(instructionSet);
    instructionSet.add({
      renderPipeId: "filter",
      action: "popFilter",
      canBundle: false
    });
  }
  /**
   * called when the instruction build process is starting this will reset internally to the default blend mode
   * @internal
   * @ignore
   */
  buildStart() {
    this._isAdvanced = false;
  }
  /**
   * called when the instruction build process is finished, ensuring that if there is an advanced blend mode
   * active, we add the final render instructions added to the instruction set
   * @param instructionSet - The instruction set we are adding to
   * @internal
   * @ignore
   */
  buildEnd(instructionSet) {
    if (this._isAdvanced) {
      this._endAdvancedBlendMode(instructionSet);
    }
  }
  /**
   * @internal
   * @ignore
   */
  destroy() {
    this._renderer = null;
    this._renderableList = null;
    for (const i in this._filterHash) {
      this._filterHash[i].destroy();
    }
    this._filterHash = null;
  }
}
/** @ignore */
BlendModePipe.extension = {
  type: [
    ExtensionType.WebGLPipes,
    ExtensionType.WebGPUPipes,
    ExtensionType.CanvasPipes
  ],
  name: "blendMode"
};

const imageTypes = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp"
};
const _ExtractSystem = class _ExtractSystem {
  /** @param renderer - The renderer this System works for. */
  constructor(renderer) {
    this._renderer = renderer;
  }
  _normalizeOptions(options, defaults = {}) {
    if (options instanceof Container || options instanceof Texture) {
      return {
        target: options,
        ...defaults
      };
    }
    return {
      ...defaults,
      ...options
    };
  }
  /**
   * Will return a HTML Image of the target
   * @param options - The options for creating the image, or the target to extract
   * @returns - HTML Image of the target
   */
  async image(options) {
    const image = new Image();
    image.src = await this.base64(options);
    return image;
  }
  /**
   * Will return a base64 encoded string of this target. It works by calling
   * `Extract.canvas` and then running toDataURL on that.
   * @param options - The options for creating the image, or the target to extract
   */
  async base64(options) {
    options = this._normalizeOptions(
      options,
      _ExtractSystem.defaultImageOptions
    );
    const { format, quality } = options;
    const canvas = this.canvas(options);
    if (canvas.toBlob !== void 0) {
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("ICanvas.toBlob failed!"));
            return;
          }
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }, imageTypes[format], quality);
      });
    }
    if (canvas.toDataURL !== void 0) {
      return canvas.toDataURL(imageTypes[format], quality);
    }
    if (canvas.convertToBlob !== void 0) {
      const blob = await canvas.convertToBlob({ type: imageTypes[format], quality });
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
    throw new Error("Extract.base64() requires ICanvas.toDataURL, ICanvas.toBlob, or ICanvas.convertToBlob to be implemented");
  }
  /**
   * Creates a Canvas element, renders this target to it and then returns it.
   * @param options - The options for creating the canvas, or the target to extract
   * @returns - A Canvas element with the texture rendered on.
   */
  canvas(options) {
    options = this._normalizeOptions(options);
    const target = options.target;
    const renderer = this._renderer;
    if (target instanceof Texture) {
      return renderer.texture.generateCanvas(target);
    }
    const texture = renderer.textureGenerator.generateTexture(options);
    const canvas = renderer.texture.generateCanvas(texture);
    texture.destroy();
    return canvas;
  }
  /**
   * Will return a one-dimensional array containing the pixel data of the entire texture in RGBA
   * order, with integer values between 0 and 255 (included).
   * @param options - The options for extracting the image, or the target to extract
   * @returns - One-dimensional array containing the pixel data of the entire texture
   */
  pixels(options) {
    options = this._normalizeOptions(options);
    const target = options.target;
    const renderer = this._renderer;
    const texture = target instanceof Texture ? target : renderer.textureGenerator.generateTexture(options);
    const pixelInfo = renderer.texture.getPixels(texture);
    if (target instanceof Container) {
      texture.destroy();
    }
    return pixelInfo;
  }
  /**
   * Will return a texture of the target
   * @param options - The options for creating the texture, or the target to extract
   * @returns - A texture of the target
   */
  texture(options) {
    options = this._normalizeOptions(options);
    if (options.target instanceof Texture)
      return options.target;
    return this._renderer.textureGenerator.generateTexture(options);
  }
  /**
   * Will extract a HTMLImage of the target and download it
   * @param options - The options for downloading and extracting the image, or the target to extract
   */
  download(options) {
    options = this._normalizeOptions(options);
    const canvas = this.canvas(options);
    const link = document.createElement("a");
    link.download = options.filename ?? "image.png";
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  /**
   * Logs the target to the console as an image. This is a useful way to debug what's happening in the renderer.
   * @param options - The options for logging the image, or the target to log
   */
  log(options) {
    const width = options.width ?? 200;
    options = this._normalizeOptions(options);
    const canvas = this.canvas(options);
    const base64 = canvas.toDataURL();
    console.log(`[Pixi Texture] ${canvas.width}px ${canvas.height}px`);
    const style = [
      "font-size: 1px;",
      `padding: ${width}px ${300}px;`,
      `background: url(${base64}) no-repeat;`,
      "background-size: contain;"
    ].join(" ");
    console.log("%c ", style);
  }
  destroy() {
    this._renderer = null;
  }
};
/** @ignore */
_ExtractSystem.extension = {
  type: [
    ExtensionType.WebGLSystem,
    ExtensionType.WebGPUSystem
  ],
  name: "extract"
};
/** Default options for creating an image. */
_ExtractSystem.defaultImageOptions = {
  /** The format of the image. */
  format: "png",
  /** The quality of the image. */
  quality: 1
};
let ExtractSystem = _ExtractSystem;

class RenderTexture extends Texture {
  static create(options) {
    return new Texture({
      source: new TextureSource(options)
    });
  }
  /**
   * Resizes the render texture.
   * @param width - The new width of the render texture.
   * @param height - The new height of the render texture.
   * @param resolution - The new resolution of the render texture.
   * @returns This texture.
   */
  resize(width, height, resolution) {
    this.source.resize(width, height, resolution);
    return this;
  }
}

const tempRect = new Rectangle();
const tempBounds = new Bounds();
const noColor = [0, 0, 0, 0];
class GenerateTextureSystem {
  constructor(renderer) {
    this._renderer = renderer;
  }
  /**
   * A Useful function that returns a texture of the display object that can then be used to create sprites
   * This can be quite useful if your container is complicated and needs to be reused multiple times.
   * @param {GenerateTextureOptions | Container} options - Generate texture options.
   * @param {Container} [options.container] - If not given, the renderer's resolution is used.
   * @param {Rectangle} options.region - The region of the container, that shall be rendered,
   * @param {number} [options.resolution] - The resolution of the texture being generated.
   *        if no region is specified, defaults to the local bounds of the container.
   * @param {GenerateTextureSourceOptions} [options.textureSourceOptions] - Texture options for GPU.
   * @returns a shiny new texture of the container passed in
   */
  generateTexture(options) {
    if (options instanceof Container) {
      options = {
        target: options,
        frame: void 0,
        textureSourceOptions: {},
        resolution: void 0
      };
    }
    const resolution = options.resolution || this._renderer.resolution;
    const antialias = options.antialias || this._renderer.view.antialias;
    const container = options.target;
    let clearColor = options.clearColor;
    if (clearColor) {
      const isRGBAArray = Array.isArray(clearColor) && clearColor.length === 4;
      clearColor = isRGBAArray ? clearColor : Color.shared.setValue(clearColor).toArray();
    } else {
      clearColor = noColor;
    }
    const region = options.frame?.copyTo(tempRect) || getLocalBounds(container, tempBounds).rectangle;
    region.width = Math.max(region.width, 1 / resolution) | 0;
    region.height = Math.max(region.height, 1 / resolution) | 0;
    const target = RenderTexture.create({
      ...options.textureSourceOptions,
      width: region.width,
      height: region.height,
      resolution,
      antialias
    });
    const transform = Matrix.shared.translate(-region.x, -region.y);
    this._renderer.render({
      container,
      transform,
      target,
      clearColor
    });
    target.source.updateMipmaps();
    return target;
  }
  destroy() {
    this._renderer = null;
  }
}
/** @ignore */
GenerateTextureSystem.extension = {
  type: [
    ExtensionType.WebGLSystem,
    ExtensionType.WebGPUSystem
  ],
  name: "textureGenerator"
};

class GlobalUniformSystem {
  constructor(renderer) {
    this._stackIndex = 0;
    this._globalUniformDataStack = [];
    this._uniformsPool = [];
    this._activeUniforms = [];
    this._bindGroupPool = [];
    this._activeBindGroups = [];
    this._renderer = renderer;
  }
  reset() {
    this._stackIndex = 0;
    for (let i = 0; i < this._activeUniforms.length; i++) {
      this._uniformsPool.push(this._activeUniforms[i]);
    }
    for (let i = 0; i < this._activeBindGroups.length; i++) {
      this._bindGroupPool.push(this._activeBindGroups[i]);
    }
    this._activeUniforms.length = 0;
    this._activeBindGroups.length = 0;
  }
  start(options) {
    this.reset();
    this.push(options);
  }
  bind({
    size,
    projectionMatrix,
    worldTransformMatrix,
    worldColor,
    offset
  }) {
    const renderTarget = this._renderer.renderTarget.renderTarget;
    const currentGlobalUniformData = this._stackIndex ? this._globalUniformDataStack[this._stackIndex - 1] : {
      projectionData: renderTarget,
      worldTransformMatrix: new Matrix(),
      worldColor: 4294967295,
      offset: new Point()
    };
    const globalUniformData = {
      projectionMatrix: projectionMatrix || this._renderer.renderTarget.projectionMatrix,
      resolution: size || renderTarget.size,
      worldTransformMatrix: worldTransformMatrix || currentGlobalUniformData.worldTransformMatrix,
      worldColor: worldColor || currentGlobalUniformData.worldColor,
      offset: offset || currentGlobalUniformData.offset,
      bindGroup: null
    };
    const uniformGroup = this._uniformsPool.pop() || this._createUniforms();
    this._activeUniforms.push(uniformGroup);
    const uniforms = uniformGroup.uniforms;
    uniforms.uProjectionMatrix = globalUniformData.projectionMatrix;
    uniforms.uResolution = globalUniformData.resolution;
    uniforms.uWorldTransformMatrix.copyFrom(globalUniformData.worldTransformMatrix);
    uniforms.uWorldTransformMatrix.tx -= globalUniformData.offset.x;
    uniforms.uWorldTransformMatrix.ty -= globalUniformData.offset.y;
    color32BitToUniform(
      globalUniformData.worldColor,
      uniforms.uWorldColorAlpha,
      0
    );
    uniformGroup.update();
    let bindGroup;
    if (this._renderer.renderPipes.uniformBatch) {
      bindGroup = this._renderer.renderPipes.uniformBatch.getUniformBindGroup(uniformGroup, false);
    } else {
      bindGroup = this._bindGroupPool.pop() || new BindGroup();
      this._activeBindGroups.push(bindGroup);
      bindGroup.setResource(uniformGroup, 0);
    }
    globalUniformData.bindGroup = bindGroup;
    this._currentGlobalUniformData = globalUniformData;
  }
  push(options) {
    this.bind(options);
    this._globalUniformDataStack[this._stackIndex++] = this._currentGlobalUniformData;
  }
  pop() {
    this._currentGlobalUniformData = this._globalUniformDataStack[--this._stackIndex - 1];
    if (this._renderer.type === RendererType.WEBGL) {
      this._currentGlobalUniformData.bindGroup.resources[0].update();
    }
  }
  get bindGroup() {
    return this._currentGlobalUniformData.bindGroup;
  }
  get uniformGroup() {
    return this._currentGlobalUniformData.bindGroup.resources[0];
  }
  _createUniforms() {
    const globalUniforms = new UniformGroup({
      uProjectionMatrix: { value: new Matrix(), type: "mat3x3<f32>" },
      uWorldTransformMatrix: { value: new Matrix(), type: "mat3x3<f32>" },
      // TODO - someone smart - set this to be a unorm8x4 rather than a vec4<f32>
      uWorldColorAlpha: { value: new Float32Array(4), type: "vec4<f32>" },
      uResolution: { value: [0, 0], type: "vec2<f32>" }
    }, {
      isStatic: true
    });
    return globalUniforms;
  }
  destroy() {
    this._renderer = null;
  }
}
/** @ignore */
GlobalUniformSystem.extension = {
  type: [
    ExtensionType.WebGLSystem,
    ExtensionType.WebGPUSystem,
    ExtensionType.CanvasSystem
  ],
  name: "globalUniforms"
};

let saidHello = false;
const VERSION = "8.2.5";
function sayHello(type) {
  if (saidHello) {
    return;
  }
  if (DOMAdapter.get().getNavigator().userAgent.toLowerCase().indexOf("chrome") > -1) {
    const args = [
      `%c  %c  %c  %c  %c PixiJS %c v${VERSION} (${type}) http://www.pixijs.com/

`,
      "background: #E72264; padding:5px 0;",
      "background: #6CA2EA; padding:5px 0;",
      "background: #B5D33D; padding:5px 0;",
      "background: #FED23F; padding:5px 0;",
      "color: #FFFFFF; background: #E72264; padding:5px 0;",
      "color: #E72264; background: #FFFFFF; padding:5px 0;"
    ];
    globalThis.console.log(...args);
  } else if (globalThis.console) {
    globalThis.console.log(`PixiJS ${VERSION} - ${type} - http://www.pixijs.com/`);
  }
  saidHello = true;
}

class HelloSystem {
  constructor(renderer) {
    this._renderer = renderer;
  }
  /**
   * It all starts here! This initiates every system, passing in the options for any system by name.
   * @param options - the config for the renderer and all its systems
   */
  init(options) {
    if (options.hello) {
      let name = this._renderer.name;
      if (this._renderer.type === RendererType.WEBGL) {
        name += ` ${this._renderer.context.webGLVersion}`;
      }
      sayHello(name);
    }
  }
}
/** @ignore */
HelloSystem.extension = {
  type: [
    ExtensionType.WebGLSystem,
    ExtensionType.WebGPUSystem,
    ExtensionType.CanvasSystem
  ],
  name: "hello",
  priority: -2
};
/** The default options for the system. */
HelloSystem.defaultOptions = {
  /** {@link WebGLOptions.hello} */
  hello: false
};

const _TextureGCSystem = class _TextureGCSystem {
  /** @param renderer - The renderer this System works for. */
  constructor(renderer) {
    this._renderer = renderer;
    this.count = 0;
    this.checkCount = 0;
  }
  init(options) {
    options = { ..._TextureGCSystem.defaultOptions, ...options };
    this.checkCountMax = options.textureGCCheckCountMax;
    this.maxIdle = options.textureGCAMaxIdle;
    this.active = options.textureGCActive;
  }
  /**
   * Checks to see when the last time a texture was used.
   * If the texture has not been used for a specified amount of time, it will be removed from the GPU.
   */
  postrender() {
    if (!this._renderer.renderingToScreen) {
      return;
    }
    this.count++;
    if (!this.active)
      return;
    this.checkCount++;
    if (this.checkCount > this.checkCountMax) {
      this.checkCount = 0;
      this.run();
    }
  }
  /**
   * Checks to see when the last time a texture was used.
   * If the texture has not been used for a specified amount of time, it will be removed from the GPU.
   */
  run() {
    const managedTextures = this._renderer.texture.managedTextures;
    for (let i = 0; i < managedTextures.length; i++) {
      const texture = managedTextures[i];
      if (texture.autoGarbageCollect && texture.resource && texture._touched > -1 && this.count - texture._touched > this.maxIdle) {
        texture._touched = -1;
        texture.unload();
      }
    }
  }
  destroy() {
    this._renderer = null;
  }
};
/** @ignore */
_TextureGCSystem.extension = {
  type: [
    ExtensionType.WebGLSystem,
    ExtensionType.WebGPUSystem
  ],
  name: "textureGC"
};
/** default options for the TextureGCSystem */
_TextureGCSystem.defaultOptions = {
  /**
   * If set to true, this will enable the garbage collector on the GPU.
   * @default true
   */
  textureGCActive: true,
  /**
   * The maximum idle frames before a texture is destroyed by garbage collection.
   * @default 60 * 60
   */
  textureGCAMaxIdle: 60 * 60,
  /**
   * Frames between two garbage collections.
   * @default 600
   */
  textureGCCheckCountMax: 600
};
let TextureGCSystem = _TextureGCSystem;
extensions.add(TextureGCSystem);

const _ViewSystem = class _ViewSystem {
  /** The resolution / device pixel ratio of the renderer. */
  get resolution() {
    return this.texture.source._resolution;
  }
  set resolution(value) {
    this.texture.source.resize(
      this.texture.source.width,
      this.texture.source.height,
      value
    );
  }
  /**
   * initiates the view system
   * @param options - the options for the view
   */
  init(options) {
    options = {
      ..._ViewSystem.defaultOptions,
      ...options
    };
    if (options.view) {
      deprecation(v8_0_0, "ViewSystem.view has been renamed to ViewSystem.canvas");
      options.canvas = options.view;
    }
    this.screen = new Rectangle(0, 0, options.width, options.height);
    this.canvas = options.canvas || DOMAdapter.get().createCanvas();
    this.antialias = !!options.antialias;
    this.texture = getCanvasTexture(this.canvas, options);
    this.renderTarget = new RenderTarget({
      colorTextures: [this.texture],
      depth: !!options.depth,
      isRoot: true
    });
    this.texture.source.transparent = options.backgroundAlpha < 1;
    this.multiView = !!options.multiView;
    if (this.autoDensity) {
      this.canvas.style.width = `${this.texture.width}px`;
      this.canvas.style.height = `${this.texture.height}px`;
    }
    this.resolution = options.resolution;
  }
  /**
   * Resizes the screen and canvas to the specified dimensions.
   * @param desiredScreenWidth - The new width of the screen.
   * @param desiredScreenHeight - The new height of the screen.
   * @param resolution
   */
  resize(desiredScreenWidth, desiredScreenHeight, resolution) {
    this.texture.source.resize(desiredScreenWidth, desiredScreenHeight, resolution);
    this.screen.width = this.texture.frame.width;
    this.screen.height = this.texture.frame.height;
    if (this.autoDensity) {
      this.canvas.style.width = `${desiredScreenWidth}px`;
      this.canvas.style.height = `${desiredScreenHeight}px`;
    }
  }
  /**
   * Destroys this System and optionally removes the canvas from the dom.
   * @param {options | false} options - The options for destroying the view, or "false".
   * @param options.removeView - Whether to remove the view element from the DOM. Defaults to `false`.
   */
  destroy(options = false) {
    const removeView = typeof options === "boolean" ? options : !!options?.removeView;
    if (removeView && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
};
/** @ignore */
_ViewSystem.extension = {
  type: [
    ExtensionType.WebGLSystem,
    ExtensionType.WebGPUSystem,
    ExtensionType.CanvasSystem
  ],
  name: "view",
  priority: 0
};
/** The default options for the view system. */
_ViewSystem.defaultOptions = {
  /**
   * {@link WebGLOptions.width}
   * @default 800
   */
  width: 800,
  /**
   * {@link WebGLOptions.height}
   * @default 600
   */
  height: 600,
  /**
   * {@link WebGLOptions.autoDensity}
   * @default false
   */
  autoDensity: false,
  /**
   * {@link WebGLOptions.antialias}
   * @default false
   */
  antialias: false
};
let ViewSystem = _ViewSystem;

const SharedSystems = [
  BackgroundSystem,
  GlobalUniformSystem,
  HelloSystem,
  ViewSystem,
  RenderGroupSystem,
  TextureGCSystem,
  GenerateTextureSystem,
  ExtractSystem,
  RendererInitHook
];
const SharedRenderPipes = [
  BlendModePipe,
  BatcherPipe,
  SpritePipe,
  RenderGroupPipe,
  AlphaMaskPipe,
  StencilMaskPipe,
  ColorMaskPipe,
  CustomRenderPipe
];

export { BufferResource as B, GpuStencilModesToPixi as G, RenderTargetSystem as R, SharedSystems as S, UboSystem as U, SharedRenderPipes as a, uboSyncFunctionsSTD40 as b, createUboSyncFunction as c, uniformParsers as d, ensureAttributes as e, textureBitGl as f, textureBit as t, uboSyncFunctionsWGSL as u };
