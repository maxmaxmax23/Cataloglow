import React, { useState, useEffect } from "react";
import { GitHubConfig, saveCmsToGithub } from "../../src/services/gitCmsService";
import staticCmsData from "../../src/cms_content.json";

interface CMSManagerProps {
    addLog: (msg: string) => void;
}

export const CMSManager: React.FC<CMSManagerProps> = ({ addLog }) => {
    // We start with the locally compiled CMS data.
    const [cmsState, setCmsState] = useState<any>(staticCmsData);
    
    // GitHub Credentials
    const [githubToken, setGithubToken] = useState(localStorage.getItem('github_cms_token') || '');
    const [githubOwner, setGithubOwner] = useState(localStorage.getItem('github_cms_owner') || '');
    const [githubRepo, setGithubRepo] = useState(localStorage.getItem('github_cms_repo') || '');
    const [githubTestBranch, setGithubTestBranch] = useState(localStorage.getItem('github_cms_test_branch') || 'test');
    const [githubProdBranch, setGithubProdBranch] = useState(localStorage.getItem('github_cms_prod_branch') || 'main');
    
    const [isSavingTest, setIsSavingTest] = useState(false);
    const [isSavingProd, setIsSavingProd] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Persist settings
    useEffect(() => {
        localStorage.setItem('github_cms_token', githubToken);
        localStorage.setItem('github_cms_owner', githubOwner);
        localStorage.setItem('github_cms_repo', githubRepo);
        localStorage.setItem('github_cms_test_branch', githubTestBranch);
        localStorage.setItem('github_cms_prod_branch', githubProdBranch);
    }, [githubToken, githubOwner, githubRepo, githubTestBranch, githubProdBranch]);

    const saveToBranch = async (targetBranch: string, isProd: boolean) => {
        if (!githubToken || !githubOwner || !githubRepo || !targetBranch) {
            alert("Please configure your GitHub settings first.");
            setShowSettings(true);
            return;
        }

        if (isProd && !confirm(`Are you sure you want to push these changes to production (${targetBranch})?`)) {
            return;
        }

        isProd ? setIsSavingProd(true) : setIsSavingTest(true);
        addLog(`Compiling CMS mapping for branch: ${targetBranch}...`);
        
        const config: GitHubConfig = {
            token: githubToken,
            owner: githubOwner,
            repo: githubRepo,
            branch: targetBranch
        };

        try {
            await saveCmsToGithub(config, 'src/cms_content.json', cmsState, `Update CMS via Admin (${isProd ? 'Prod' : 'Test'})`);
            addLog(`✅ CMS Content pushed successfully to ${targetBranch}!`);
            addLog(`Build triggered for ${targetBranch}. Changes will be live in ~2-5 minutes.`);
        } catch(e: any) {
            addLog(`❌ API Error on ${targetBranch}: ` + e.message);
        } finally {
            isProd ? setIsSavingProd(false) : setIsSavingTest(false);
        }
    };

    const updateField = (path: string[], value: string) => {
        setCmsState((prev: any) => {
            const newState = JSON.parse(JSON.stringify(prev));
            let curr = newState;
            for (let i = 0; i < path.length - 1; i++) {
                curr = curr[path[i]];
            }
            curr[path[path.length - 1]] = value;
            return newState;
        });
    };

    // Helper to render form groups. Flattens JSON slightly for UI simplicity.
    const renderSection = (title: string, dataNode: any, pathTracker: string[]) => {
        return (
            <div className="mb-8 border border-white/10 bg-black p-6" key={title}>
                <h3 className="text-xl font-cinzel text-primary mb-6 border-b border-primary/20 pb-2">{title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.keys(dataNode).map((key) => {
                        const pathString = [...pathTracker, key].join('.');
                        if (typeof dataNode[key] === 'object') {
                             return (
                                 <div className="col-span-full mt-4" key={key}>
                                     <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">{key} Settings</h4>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4 border-l border-white/10">
                                         {Object.keys(dataNode[key]).map((subKey) => (
                                              <div key={subKey} className="flex flex-col gap-2">
                                                  <label className="text-[10px] uppercase tracking-widest text-white/40">{subKey}</label>
                                                  {subKey.toLowerCase().includes('description') || dataNode[key][subKey].length > 60 ? (
                                                      <textarea 
                                                          rows={3}
                                                          value={dataNode[key][subKey]}
                                                          onChange={(e) => updateField([...pathTracker, key, subKey], e.target.value)}
                                                          className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:border-primary outline-none transition-colors"
                                                      />
                                                  ) : (
                                                      <input
                                                          type="text"
                                                          value={dataNode[key][subKey]}
                                                          onChange={(e) => updateField([...pathTracker, key, subKey], e.target.value)}
                                                          className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:border-primary outline-none transition-colors"
                                                      />
                                                  )}
                                              </div>
                                         ))}
                                     </div>
                                 </div>
                             )
                        } else {
                            return (
                                <div key={key} className="flex flex-col gap-2 col-span-full">
                                    <label className="text-[10px] uppercase tracking-widest text-white/40">{key}</label>
                                    <input
                                        type="text"
                                        value={dataNode[key]}
                                        onChange={(e) => updateField([...pathTracker, key], e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:border-primary outline-none transition-colors"
                                    />
                                </div>
                            )
                        }
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="py-6">
             <div className="flex justify-between items-center mb-8">
                 <div>
                     <h2 className="text-2xl font-cinzel text-white">Content Architecture</h2>
                     <p className="text-xs uppercase tracking-[0.2em] text-white/40">Modify client-facing strings instantly via static ingestion.</p>
                 </div>
                 <div className="flex gap-4">
                     <button
                         onClick={() => setShowSettings(!showSettings)}
                         className="px-4 border border-white/10 text-white/40 hover:text-white transition-colors flex items-center gap-2 text-xs uppercase"
                     >
                         <span className="material-symbols-outlined text-sm">settings</span> Settings
                     </button>
                     <button
                         onClick={() => saveToBranch(githubTestBranch, false)}
                         disabled={isSavingTest || isSavingProd}
                         className={`px-6 border transition-colors flex items-center gap-2 text-xs uppercase font-bold tracking-widest ${isSavingTest ? 'border-primary/50 text-white/40 cursor-not-allowed' : 'border-white/10 text-white/60 hover:text-white hover:border-white'}`}
                     >
                         <span className="material-symbols-outlined text-sm">science</span> 
                         {isSavingTest ? "Publishing..." : "Publish To Test"}
                     </button>
                     <button
                         onClick={() => saveToBranch(githubProdBranch, true)}
                         disabled={isSavingProd || isSavingTest}
                         className={`px-6 border transition-colors flex items-center gap-2 text-xs uppercase font-bold tracking-widest ${isSavingProd ? 'border-primary/50 text-primary/50 cursor-not-allowed' : 'bg-primary text-black border-primary hover:bg-white'}`}
                     >
                         <span className="material-symbols-outlined text-sm">publish</span> 
                         {isSavingProd ? "Promoting..." : "Promote To Prod"}
                     </button>
                 </div>
             </div>

             {/* Github Settings Drawer/Panel */}
             {showSettings && (
                 <div className="mb-8 border border-white/10 bg-white/5 p-6 grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up">
                     <div className="col-span-1 md:col-span-4 mb-2">
                         <h3 className="text-primary text-xs tracking-widest uppercase font-bold">Deploy Configuration Settings</h3>
                     </div>
                     <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-widest text-white/40">GitHub Token</label>
                          <input type="password" value={githubToken} onChange={e => setGithubToken(e.target.value)} className="w-full bg-black/50 border border-white/10 p-3 text-xs text-white" placeholder="ghp_***" />
                     </div>
                     <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-widest text-white/40">Repo Owner</label>
                          <input type="text" value={githubOwner} onChange={e => setGithubOwner(e.target.value)} className="w-full bg-black/50 border border-white/10 p-3 text-xs text-white" placeholder="e.g. acmecorp" />
                     </div>
                     <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-widest text-white/40">Repo Name</label>
                          <input type="text" value={githubRepo} onChange={e => setGithubRepo(e.target.value)} className="w-full bg-black/50 border border-white/10 p-3 text-xs text-white" placeholder="e.g. glowapp-web" />
                     </div>
                     <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-widest text-white/40">Test Branch</label>
                          <input type="text" value={githubTestBranch} onChange={e => setGithubTestBranch(e.target.value)} className="w-full bg-black/50 border border-white/10 p-3 text-xs text-white" placeholder="test" />
                     </div>
                     <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-widest text-white/40">Production Branch</label>
                          <input type="text" value={githubProdBranch} onChange={e => setGithubProdBranch(e.target.value)} className="w-full bg-black/50 border border-white/10 p-3 text-xs text-white" placeholder="main" />
                     </div>
                 </div>
             )}

             {/* Dynamic Form Editor */}
             {Object.keys(cmsState).map(topLevelKey => (
                 renderSection(topLevelKey.toUpperCase(), cmsState[topLevelKey], [topLevelKey])
             ))}
        </div>
    );
};
