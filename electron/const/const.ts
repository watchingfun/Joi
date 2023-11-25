export const Handle = {
	connected: "lcu:connected", //客户端连接完成时发送信号
	connecting: "lcu:connecting", //客户端连接中时发送信号
	disconnect: "lcu:disconnect", //客户端断开连接时发送信号
	gameFlowPhase: "lcu:gameFlowPhase", //游戏流程阶段变更时发送阶段名
	champSelect: "lcu:champSelect", //确认英雄时发送英雄id
	gameSessionData: "lcu:gameSessionData", //进入对局前，发送游戏阶段数据（ban,pick,英雄选择,大乱斗上方英雄池)
	gameSessionMyTeam: "lcu:gameSessionMyTeam", //进入游戏选择英雄界面时，发送我方成员
	gameSessionRoomId: "lcu:gameSessionRoomId", //进入游戏选择英雄界面时，发送房间聊天室id
	gameTeams: "lcu:gameTeams", //游戏准备开始时，发送双方成员
	queryTeamMemberGameDetail: "lcu:queryTeamMemberGameDetail", //查询召唤师20局对局详情
	getCurrentSummoner: "lcu:getCurrentSummoner", //获取当前召唤师信息
	queryGameDetails: "lcu:queryGameDetails", //通过游戏对局id查询对局详情
	queryMatchHistory: "lcu:queryMatchHistory", //查询最近游玩记录
	killRender: "lcu:killRender", //杀掉客户端界面 让其重启界面
	queryConnectStatus: "lcu:queryConnectStatus", //查询连接状态
	getSummonerByName: "lcu:getSummonerByName", //查询召唤师 通过名字
	getSummonerByPuuid: "lcu:getSummonerByPuuid", //查询召唤师 通过puuid
	getCustomRunes: "lcu:getCustomRunes", //根据英雄，位置 游戏模式 获取自定义符文
	getOPGGRunes: "lcu:getOPGGRunes", //根据英雄，位置 游戏模式 获取opgg符文
	applyRune: "lcu:applyRune", //应用符文
	sendChatMsgToRoom: "lcu:sendChatMsgToRoom", //发送聊天消息到对局房间
	playAgain: "lcu:playAgain", // 回到大厅
	matchmaking: "lcu:matchmaking", //开始匹配 寻找对局
	openLogDir: "openLogDir", //打开日志文件夹
	showMainWindow: "showMainWindow", //显示主界面
	log: "log" //记录日志
};

export const chatDividerLine = "-----------------------------------------";
