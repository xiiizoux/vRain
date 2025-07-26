# 多阶段构建 - 前端构建阶段
FROM node:18-alpine AS frontend-builder

WORKDIR /app/webui/frontend

# 复制前端package文件
COPY webui/frontend/package*.json ./

# 安装前端依赖（包括开发依赖，用于构建）
RUN npm ci

# 复制前端源代码
COPY webui/frontend/ ./

# 构建前端应用
RUN npm run build

# 主构建阶段 - 使用Alpine Linux作为基础镜像
FROM alpine:3.19

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8
ENV NODE_ENV=production

# 安装系统依赖、编译Perl模块和Node.js，然后清理构建依赖（单层优化）
RUN apk add --no-cache \
    # 运行时依赖
    perl \
    imagemagick \
    imagemagick-perlmagick \
    freetype \
    fontconfig \
    ghostscript \
    bash \
    curl \
    nginx \
    nodejs \
    npm \
    ca-certificates \
    tzdata \
    && apk add --no-cache --virtual .build-deps \
    # 构建时依赖
    perl-dev \
    perl-app-cpanminus \
    build-base \
    make \
    gcc \
    g++ \
    imagemagick-dev \
    freetype-dev \
    fontconfig-dev \
    zlib-dev \
    libpng-dev \
    jpeg-dev \
    libjpeg-turbo-dev \
    pkgconf \
    wget \
    git \
    # 安装Perl模块（按依赖顺序安装）
    && echo "安装Perl模块..." \
    && cpanm --notest --no-man-pages --verbose \
        Module::Build \
        ExtUtils::MakeMaker \
        Test::More \
        File::Which \
        Alien::Base \
        Alien::Build \
        PDF::Builder \
        Font::FreeType \
        Encode::HanConvert \
        Image::Magick \
        POSIX \
        Getopt::Std \
        Encode \
    # 验证Perl模块安装
    && echo "验证Perl模块安装..." \
    && perl -e "use PDF::Builder; print 'PDF::Builder OK\n';" \
    && perl -e "use Font::FreeType; print 'Font::FreeType OK\n';" \
    && perl -e "use Encode::HanConvert; print 'Encode::HanConvert OK\n';" \
    && perl -e "use Image::Magick; print 'Image::Magick OK\n';" \
    && perl -e "use Getopt::Std; print 'Getopt::Std OK\n';" \
    && perl -e "use Encode; print 'Encode OK\n';" \
    && perl -e "use POSIX; print 'POSIX OK\n';" \
    # 清理构建依赖和缓存
    && apk del .build-deps \
    && rm -rf /var/cache/apk/* \
    && rm -rf /root/.cpanm \
    && rm -rf /tmp/*

# 配置ImageMagick安全策略（允许PDF处理）
RUN sed -i 's/rights="none" pattern="PDF"/rights="read|write" pattern="PDF"/' /etc/ImageMagick-7/policy.xml || \
    sed -i 's/rights="none" pattern="PDF"/rights="read|write" pattern="PDF"/' /etc/ImageMagick-6/policy.xml || true

# 复制依赖验证脚本
COPY docker/verify-dependencies.sh /tmp/verify-dependencies.sh
RUN chmod +x /tmp/verify-dependencies.sh

# 复制项目文件
COPY . .

# 复制前端构建产物
COPY --from=frontend-builder /app/webui/frontend/dist /app/webui/frontend/dist

# 安装WebUI后端依赖
WORKDIR /app/webui/backend
COPY webui/backend/package*.json ./
RUN npm ci --only=production

# 回到主工作目录
WORKDIR /app

# 设置脚本执行权限
RUN chmod +x vrain.pl \
    && chmod +x canvas/*.pl \
    && chmod +x tools/*.pl \
    && chmod +x docker-entrypoint.sh \
    && chmod +x webui/start.sh

# 创建必要目录
RUN mkdir -p /app/output \
    && mkdir -p /app/logs/webui \
    && mkdir -p /var/log/nginx \
    && mkdir -p /var/lib/nginx/tmp

# 运行依赖验证
RUN /tmp/verify-dependencies.sh && rm /tmp/verify-dependencies.sh

# 配置nginx
COPY docker/nginx.conf /etc/nginx/nginx.conf

# 创建启动脚本
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# 暴露端口
EXPOSE 3012

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3012/health || exit 1

# 使用新的启动脚本
CMD ["/entrypoint.sh"]
