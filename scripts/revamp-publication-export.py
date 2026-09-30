"""Export exact Git blobs/tree for authenticated connector publication, no secrets read."""
import base64,json,os,pathlib,subprocess,sys
root=pathlib.Path.cwd(); out=root/(sys.argv[2] if len(sys.argv)>2 else '.revamp-git-upload');out.mkdir(parents=True,exist_ok=True)
env=dict(os.environ,GIT_OBJECT_DIRECTORY=str(root/'.revamp-git-objects'),GIT_ALTERNATE_OBJECT_DIRECTORIES='D:/OffloadedProjects/dew-theory/.git/objects')
def git(*args):
    return subprocess.check_output(['git','-c','safe.directory='+root.as_posix(),*args],env=env)
def tree(ref):
    result={}
    for row in git('ls-tree','-rz',ref).split(b'\0'):
        if not row:continue
        info,name=row.split(b'\t',1); mode,kind,sha=info.decode().split();result[name.decode()]={'path':name.decode(),'mode':mode,'type':kind,'sha':sha}
    return result
base_ref=sys.argv[1] if len(sys.argv)>1 else 'origin/main'
base=tree(base_ref);current=tree('HEAD');entries=[];blobs={}
for name,entry in current.items():
    if base.get(name)==entry:continue
    if any(part in ['.env','.dev.vars','runtime'] for part in pathlib.PurePosixPath(name).parts):raise RuntimeError('Protected file in publication diff: '+name)
    raw=git('cat-file','blob',entry['sha']);payload={'sha':entry['sha'],'content':base64.b64encode(raw).decode(),'encoding':'base64'}
    try: payload={'sha':entry['sha'],'content':raw.decode('utf-8'),'encoding':'utf-8'}
    except UnicodeDecodeError:pass
    if entry['sha'] not in blobs:
        text=json.dumps(payload,ensure_ascii=True);(out/(entry['sha']+'.json')).write_text(text,encoding='utf-8');blobs[entry['sha']]={'sha':entry['sha'],'characters':len(text),'size':len(raw),'encoding':payload['encoding']}
    entries.append(entry)
entries.extend(dict(entry,sha=None) for name,entry in base.items() if name not in current)
manifest={'localHead':git('rev-parse','HEAD').decode().strip(),'parent':sys.argv[3] if len(sys.argv)>3 else git('rev-parse',base_ref).decode().strip(),'baseTree':git('rev-parse',base_ref+'^{tree}').decode().strip(),'targetTree':git('rev-parse','HEAD^{tree}').decode().strip(),'entries':entries,'blobs':list(blobs.values())}
(out/'manifest.json').write_text(json.dumps(manifest),encoding='utf-8')
print(json.dumps({'entries':len(entries),'blobs':len(blobs),'bytes':sum(b['size'] for b in blobs.values()),'maxCharacters':max(b['characters'] for b in blobs.values()),'localHead':manifest['localHead']}))
