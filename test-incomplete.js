// 测试标记未完成延期功能的测试脚本
// 在浏览器控制台中运行此脚本来测试功能

function testIncompleteDelayFunction() {
    console.log('=== 开始测试标记未完成延期功能 ===');
    
    // 1. 清除现有数据
    localStorage.removeItem('studyPlans');
    console.log('✓ 已清除现有数据');
    
    // 2. 创建测试数据 - 今天的3个计划
    const today = new Date();
    const todayKey = today.toISOString().split('T')[0];
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowKey = tomorrow.toISOString().split('T')[0];
    
    const testData = {
        [todayKey]: {
            plans: [
                {
                    id: 1,
                    title: "测试计划1 - 20:00-20:30",
                    description: "第一个测试计划",
                    startTime: "20:00",
                    endTime: "20:30",
                    completed: false,
                    date: todayKey
                },
                {
                    id: 2,
                    title: "测试计划2 - 20:30-21:00",
                    description: "第二个测试计划（将被延期）",
                    startTime: "20:30",
                    endTime: "21:00",
                    completed: false,
                    date: todayKey
                },
                {
                    id: 3,
                    title: "测试计划3 - 21:00-21:30",
                    description: "第三个测试计划（将被延期）",
                    startTime: "21:00",
                    endTime: "21:30",
                    completed: false,
                    date: todayKey
                }
            ],
            mood: {}
        }
    };
    
    localStorage.setItem('studyPlans', JSON.stringify(testData));
    console.log('✓ 已创建测试数据');
    console.log('今天日期:', todayKey);
    console.log('明天日期:', tomorrowKey);
    
    // 3. 测试标记第二个计划为未完成
    console.log('正在测试标记计划2为未完成...');
    
    // 模拟调用 togglePlanIncomplete 函数
    if (typeof togglePlanIncomplete === 'function') {
        togglePlanIncomplete(2, todayKey, "测试延期功能");
        
        setTimeout(() => {
            // 4. 检查结果
            const result = JSON.parse(localStorage.getItem('studyPlans'));
            
            console.log('=== 测试结果 ===');
            console.log('今天的计划数:', result[todayKey] ? result[todayKey].plans.length : 0);
            console.log('明天的计划数:', result[tomorrowKey] ? result[tomorrowKey].plans.length : 0);
            
            if (result[todayKey] && result[todayKey].plans) {
                console.log('今天的计划:', result[todayKey].plans.map(p => ({
                    id: p.id,
                    title: p.title,
                    incompleteReason: p.incompleteReason
                })));
            }
            
            if (result[tomorrowKey] && result[tomorrowKey].plans) {
                console.log('明天的计划:', result[tomorrowKey].plans.map(p => ({
                    id: p.id,
                    title: p.title,
                    date: p.date,
                    postponedFrom: p.postponedFrom,
                    incompleteReason: p.incompleteReason
                })));
            }
            
            // 5. 验证是否符合预期
            const todayPlans = result[todayKey] ? result[todayKey].plans : [];
            const tomorrowPlans = result[tomorrowKey] ? result[tomorrowKey].plans : [];
            
            let hasError = false;
            
            // 验证今天应该只有1个计划（计划1）
            if (todayPlans.length !== 1) {
                console.error('❌ 错误：今天应该有1个计划，实际有', todayPlans.length);
                hasError = true;
            } else if (todayPlans[0].id !== 1) {
                console.error('❌ 错误：今天的计划应该是计划1，实际是计划', todayPlans[0].id);
                hasError = true;
            }
            
            // 验证明天应该有2个计划（计划2和3）
            if (tomorrowPlans.length !== 2) {
                console.error('❌ 错误：明天应该有2个计划，实际有', tomorrowPlans.length);
                hasError = true;
            } else {
                const tomorrowIds = tomorrowPlans.map(p => p.id).sort();
                if (tomorrowIds[0] !== 2 || tomorrowIds[1] !== 3) {
                    console.error('❌ 错误：明天的计划应该是计划2和3，实际是', tomorrowIds);
                    hasError = true;
                }
            }
            
            // 验证计划2是否有未完成原因
            const plan2 = tomorrowPlans.find(p => p.id === 2);
            if (!plan2 || !plan2.incompleteReason) {
                console.error('❌ 错误：计划2应该有未完成原因');
                hasError = true;
            }
            
            // 验证计划日期是否正确更新
            const wrongDatePlan = tomorrowPlans.find(p => p.date !== tomorrowKey);
            if (wrongDatePlan) {
                console.error('❌ 错误：存在计划的日期没有正确更新，计划ID:', wrongDatePlan.id, '日期:', wrongDatePlan.date);
                hasError = true;
            }
            
            // 验证延期标记
            const postponedPlan = tomorrowPlans.find(p => p.id === 2);
            if (!postponedPlan || !postponedPlan.postponedFrom) {
                console.warn('⚠️ 警告：延期计划缺少延期标记字段');
            }
            
            // 验证数据格式一致性
            if (result[todayKey] && !result[todayKey].mood) {
                console.warn('⚠️ 警告：今天的数据格式缺少mood字段');
            }
            
            if (result[tomorrowKey] && !result[tomorrowKey].mood) {
                console.warn('⚠️ 警告：明天的数据格式缺少mood字段');
            }
            
            if (!hasError) {
                console.log('🎉 所有核心测试通过！延期功能工作正常。');
            } else {
                console.log('💥 测试发现问题！请检查代码逻辑。');
            }
            
            console.log('=== 测试完成 ===');
        }, 1000);
    } else {
        console.error('❌ togglePlanIncomplete 函数不存在，请确保页面已正确加载');
    }
}

// 测试边界情况
function testEdgeCases() {
    console.log('=== 开始测试边界情况 ===');
    
    // 1. 测试空数据
    localStorage.removeItem('studyPlans');
    try {
        if (typeof togglePlanIncomplete === 'function') {
            togglePlanIncomplete(999, '2023-01-01', "测试空数据");
            console.log('✓ 空数据处理正常');
        }
    } catch (error) {
        console.error('❌ 空数据处理出错:', error);
    }
    
    // 2. 测试不存在的计划
    const testData = {
        '2023-01-01': {
            plans: [
                {
                    id: 1,
                    title: "测试计划",
                    startTime: "20:00",
                    endTime: "20:30",
                    date: '2023-01-01'
                }
            ],
            mood: {}
        }
    };
    localStorage.setItem('studyPlans', JSON.stringify(testData));
    
    try {
        togglePlanIncomplete(999, '2023-01-01', "测试不存在的计划");
        console.log('✓ 不存在的计划处理正常');
    } catch (error) {
        console.error('❌ 不存在的计划处理出错:', error);
    }
    
    // 3. 测试单个计划（不应延期）
    try {
        togglePlanIncomplete(1, '2023-01-01', "测试单个计划");
        console.log('✓ 单个计划处理正常');
    } catch (error) {
        console.error('❌ 单个计划处理出错:', error);
    }
    
    console.log('=== 边界情况测试完成 ===');
}

console.log('测试脚本已准备就绪');
console.log('运行 testIncompleteDelayFunction() 来执行主要功能测试');
console.log('运行 testEdgeCases() 来执行边界情况测试');