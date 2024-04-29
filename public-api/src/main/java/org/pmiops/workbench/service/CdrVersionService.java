package org.pmiops.workbench.service;

import org.pmiops.workbench.cdr.CdrVersionContext;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import jakarta.inject.Provider;
import org.springframework.beans.factory.annotation.Qualifier;
import org.pmiops.workbench.db.model.DbCdrVersion;
import org.pmiops.workbench.model.CdrVersion;
import org.pmiops.workbench.db.dao.CdrVersionDao;
import org.pmiops.workbench.cdr.CdrVersionMapper;
import java.util.List;
import java.util.stream.Collectors;


@Service
public class CdrVersionService {
    private CdrVersionDao cdrVersionDao;
    private CdrVersionMapper cdrVersionMapper;
    @Autowired
    @Qualifier("defaultCdr")
    private Provider<DbCdrVersion> defaultCdrVersionProvider;

    @Autowired
    public CdrVersionService(CdrVersionDao cdrVersionDao, CdrVersionMapper cdrVersionMapper) {
        this.cdrVersionDao = cdrVersionDao;
        this.cdrVersionMapper = cdrVersionMapper;
    }

    public void setDefaultCdrVersion() {
        CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());
    }

    public CdrVersion findByIsDefault(boolean isDefault) {
        return cdrVersionMapper.dbModelToClient(cdrVersionDao.findByIsDefault(true));
    }

    public List<CdrVersion> findAllByOrderByCreationTimeDesc() {
        List<DbCdrVersion> dbCdrVersions = cdrVersionDao
                .findAllByOrderByCreationTimeDesc();
        return dbCdrVersions.stream()
                .map(cdrVersionMapper::dbModelToClient)
                .collect(Collectors.toList());
    }
}