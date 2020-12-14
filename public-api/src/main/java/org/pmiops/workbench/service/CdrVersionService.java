package org.pmiops.workbench.service;

import org.pmiops.workbench.cdr.CdrVersionContext;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import javax.inject.Provider;
import org.springframework.beans.factory.annotation.Qualifier;
import org.pmiops.workbench.db.model.CdrVersion;
import org.pmiops.workbench.db.dao.CdrVersionDao;

@Service
public class CdrVersionService {
    private CdrVersionDao cdrVersionDao;

    @Autowired
    public CdrVersionService(CdrVersionDao cdrVersionDao) {
        this.cdrVersionDao = cdrVersionDao;
    }

    @Autowired
    @Qualifier("defaultCdr")
    private Provider<CdrVersion> defaultCdrVersionProvider;

    public void setDefaultCdrVersion() {
        CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());
    }

    public CdrVersion findByIsDefault(boolean isDefault) {
        return cdrVersionDao.findByIsDefault(true);
    }
}