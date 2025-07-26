# vRain Docker Makefile
# 提供便捷的Docker命令

.PHONY: help build run dev canvas fontcheck clean

# 默认目标
help:
	@echo "vRain Docker 生产环境便捷命令"
	@echo ""
	@echo "生产环境管理:"
	@echo "  make up             启动vRain集成服务（包括WebUI）"
	@echo "  make up-canvas      启动背景图生成服务"
	@echo "  make up-all         启动完整环境"
	@echo "  make down           停止生产环境"
	@echo "  make build          构建所有镜像"
	@echo "  make restart        重启服务"
	@echo ""
	@echo "WebUI管理:"
	@echo "  make webui-logs     查看WebUI日志"
	@echo "  make webui-dev      启动WebUI开发环境"
	@echo "  make webui-shell    进入WebUI容器"
	@echo ""
	@echo "电子书生成:"
	@echo "  make run BOOK=<id>  生成电子书"
	@echo "  make test BOOK=<id> 测试模式生成"
	@echo ""
	@echo "背景图生成:"
	@echo "  make canvas CONFIG=<id>  生成背景图"
	@echo ""
	@echo "工具命令:"
	@echo "  make fontcheck BOOK=<id> 检查字体支持"
	@echo "  make shell          进入vRain容器"
	@echo "  make logs           查看服务日志"
	@echo ""
	@echo "维护:"
	@echo "  make clean          清理Docker资源"
	@echo "  make size           显示镜像大小"
	@echo ""
	@echo "示例:"
	@echo "  make up                        # 启动集成服务"
	@echo "  make run BOOK=01 FROM=1 TO=2   # 生成电子书"
	@echo "  make webui-dev                 # 启动WebUI开发环境"
	@echo "  make canvas CONFIG=01_Black    # 生成背景图"
	@echo ""
	@echo "WebUI访问地址:"
	@echo "  集成服务: http://localhost:3012"
	@echo "  开发环境: http://localhost:3000"

# 启动vRain集成服务（包括WebUI）
up:
	docker-compose up -d vrain

# 启动背景图生成服务
up-canvas:
	docker-compose up -d canvas

# 启动完整环境
up-all:
	docker-compose up -d

# 停止生产环境
down:
	docker-compose down

# 构建所有镜像
build:
	docker-compose build

# 重启服务
restart:
	docker-compose restart

# 运行vRain主程序
run:
	@if [ -z "$(BOOK)" ]; then \
		echo "错误: 请指定书籍ID，例如: make run BOOK=01"; \
		exit 1; \
	fi
	docker-compose exec vrain perl /app/vrain.pl \
		-b $(BOOK) \
		$(if $(FROM),-f $(FROM),-f 1) \
		$(if $(TO),-t $(TO),-t 1) \
		$(if $(COMPRESS),-c) \
		$(if $(TEST),-z $(TEST)) \
		$(if $(VERBOSE),-v)

# 测试模式运行
test:
	@if [ -z "$(BOOK)" ]; then \
		echo "错误: 请指定书籍ID，例如: make test BOOK=01"; \
		exit 1; \
	fi
	docker-compose exec vrain perl /app/vrain.pl \
		-b $(BOOK) \
		-f 1 -t 1 -z 5 -v

# 生成背景图
canvas:
	@if [ -z "$(CONFIG)" ]; then \
		echo "错误: 请指定配置ID，例如: make canvas CONFIG=01_Black"; \
		exit 1; \
	fi
	docker-compose exec canvas perl /app/canvas/canvas.pl -c $(CONFIG)

# 进入vRain容器shell
shell:
	docker-compose exec vrain bash

# 查看服务日志
logs:
	docker-compose logs -f

# 生成宣纸做旧风格背景图
canvas-vintage:
	@if [ -z "$(CONFIG)" ]; then \
		echo "错误: 请指定配置ID，例如: make canvas-vintage CONFIG=vintage"; \
		exit 1; \
	fi
	docker-compose exec canvas perl /app/canvas/canvas_vintage.pl -c $(CONFIG)

# 生成竹简风格背景图
canvas-bamboo:
	@if [ -z "$(CONFIG)" ]; then \
		echo "错误: 请指定配置ID，例如: make canvas-bamboo CONFIG=bamboo"; \
		exit 1; \
	fi
	docker-compose exec canvas perl /app/canvas/canvas_bamboo.pl -c $(CONFIG)

# 检查字体支持
fontcheck:
	@if [ -z "$(BOOK)" ]; then \
		echo "错误: 请指定书籍ID，例如: make fontcheck BOOK=01"; \
		exit 1; \
	fi
	docker-compose exec -w /app/books/$(BOOK) vrain perl /app/tools/fontcheck.pl \
		$(if $(FROM),-f $(FROM)) \
		$(if $(TO),-t $(TO))

# 文本格式化
indentxt:
	@if [ -z "$(BOOK)" ]; then \
		echo "错误: 请指定书籍ID，例如: make indentxt BOOK=01"; \
		exit 1; \
	fi
	docker-compose exec -w /app/books/$(BOOK) vrain perl /app/tools/indentxt.pl \
		$(if $(FROM),-f $(FROM)) \
		$(if $(TO),-t $(TO))

# 清理Docker资源
clean:
	docker-compose down --rmi all --volumes --remove-orphans
	docker system prune -f

# 显示vRain帮助
vrain-help:
	docker-compose exec vrain perl /app/vrain.pl --help

# 查看镜像大小
size:
	@echo "镜像大小:"
	@docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep -E "(REPOSITORY|vrain)" || echo "请先构建镜像"

# 状态检查
status:
	docker-compose ps

# WebUI 相关命令
webui-logs:
	docker-compose logs -f vrain

webui-dev:
	cd webui && ./start.sh dev

webui-shell:
	docker-compose exec vrain bash
