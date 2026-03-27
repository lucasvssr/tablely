
import os
import json

def get_keys(data, prefix=''):
    keys = set()
    if isinstance(data, dict):
        for k, v in data.items():
            full_key = f"{prefix}{k}" if prefix else k
            if isinstance(v, dict):
                keys.update(get_keys(v, f"{full_key}."))
            else:
                keys.add(full_key)
    return keys

def main():
    base = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'apps', 'web', 'public', 'locales')
    fr_path = os.path.join(base, 'fr')
    en_path = os.path.join(base, 'en')
    es_path = os.path.join(base, 'es')
    de_path = os.path.join(base, 'de')
    
    fr_files = set([f for f in os.listdir(fr_path) if f.endswith('.json')])
    en_files = set([f for f in os.listdir(en_path) if f.endswith('.json')])
    es_files = set([f for f in os.listdir(es_path) if f.endswith('.json')])
    de_files = set([f for f in os.listdir(de_path) if f.endswith('.json')])
    
    all_files = fr_files | en_files | es_files | de_files
    
    print("MISSING FILES:")
    for f in all_files:
        if f not in fr_files:
            print(f"  - {f} missing in FR")
        if f not in en_files:
            print(f"  - {f} missing in EN")
        if f not in es_files:
            print(f"  - {f} missing in ES")
        if f not in de_files:
            print(f"  - {f} missing in DE")
    
    print("\nMISSING KEYS:")
    for f in all_files:
        if f in fr_files and f in en_files:
            with open(os.path.join(fr_path, f), 'r', encoding='utf-8') as f1:
                fr_data = json.load(f1)
            with open(os.path.join(en_path, f), 'r', encoding='utf-8') as f2:
                en_data = json.load(f2)
            with open(os.path.join(es_path, f), 'r', encoding='utf-8') as f3:
                es_data = json.load(f3)
            with open(os.path.join(de_path, f), 'r', encoding='utf-8') as f4:
                de_data = json.load(f4)
                
            fr_keys = get_keys(fr_data)
            en_keys = get_keys(en_data)
            es_keys = get_keys(es_data)
            de_keys = get_keys(de_data)
            
            only_fr = fr_keys - en_keys - es_keys - de_keys
            only_en = en_keys - fr_keys - es_keys - de_keys
            only_es = es_keys - fr_keys - en_keys - de_keys
            only_de = de_keys - fr_keys - en_keys - es_keys
            
            if only_fr or only_en or only_es or only_de:
                print(f"File: {f}")
                if only_fr:
                    print(f"  Only in FR: {', '.join(only_fr)}")
                if only_en:
                    print(f"  Only in EN: {', '.join(only_en)}")
                if only_es:
                    print(f"  Only in ES: {', '.join(only_es)}")
                if only_de:
                    print(f"  Only in DE: {', '.join(only_de)}")

if __name__ == "__main__":
    main()
